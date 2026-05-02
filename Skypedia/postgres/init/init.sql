------------------------- ROLES --------------------------

CREATE ROLE web LOGIN PASSWORD 'r1X5hajOYt0olOJ5DRr0DLEdbYf57YNP';
CREATE ROLE cli LOGIN PASSWORD 'H8med1meNskM1L7JmCMt3pyqSBWuRF10';

REVOKE CREATE ON DATABASE db FROM PUBLIC;
REVOKE CREATE ON DATABASE db FROM web, cli;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM web, cli;

REVOKE CONNECT ON DATABASE db FROM PUBLIC;
GRANT CONNECT ON DATABASE db TO web, cli;
GRANT USAGE ON SCHEMA public TO web, cli;

------------------------- SCHEMA -------------------------

CREATE TABLE airports (
    code CHAR(3) PRIMARY KEY,
    name TEXT,
    created_at timestamptz NOT NULL DEFAULT now(),
    gps_coordinates VARCHAR(50)
);

CREATE TABLE owners (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE groups (
    name VARCHAR(15) PRIMARY KEY,
    token TEXT NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_number TEXT UNIQUE NOT NULL,
    origin  CHAR(3) REFERENCES airports(code) NOT NULL,
    destination  CHAR(3) REFERENCES airports(code) NOT NULL,
    departure timestamptz NOT NULL,
    arrival timestamptz NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    private_description TEXT DEFAULT NULL,
    owner TEXT REFERENCES owners(username) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sensitive_cargo (
    id SERIAL PRIMARY KEY,
    flight INTEGER REFERENCES flights(id) NOT NULL,
    description TEXT NOT NULL,
	weight INTEGER NOT NULL CHECK (weight > 0),
    is_dangerous BOOLEAN NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vips (
    id SERIAL PRIMARY KEY,
    flight INTEGER UNIQUE REFERENCES flights(id) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    passport_number TEXT NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

------------------------- GRANTS -------------------------

-- web
GRANT SELECT ON airports TO web;

GRANT INSERT, SELECT on owners to web;

GRANT INSERT, SELECT on groups to web;

GRANT INSERT, SELECT ON flights TO web;
GRANT USAGE, SELECT ON SEQUENCE flights_id_seq TO web;

GRANT INSERT, SELECT ON sensitive_cargo TO web;
GRANT USAGE, SELECT ON SEQUENCE sensitive_cargo_id_seq TO web;

-- cli
GRANT SELECT ON airports TO cli;

GRANT INSERT, SELECT on owners to cli;

GRANT INSERT, SELECT ON flights TO cli;
GRANT USAGE, SELECT ON SEQUENCE flights_id_seq TO cli;

GRANT INSERT, SELECT ON vips TO cli;
GRANT USAGE, SELECT ON SEQUENCE vips_id_seq TO cli;

------------------- ROW LEVEL SECURITY -------------------

ALTER TABLE sensitive_cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_cargo FORCE ROW LEVEL SECURITY;

-- Policy to prevent inserting cargo that would exceed weight limit
CREATE POLICY prevent_cargo_weight_limit_insert
    ON sensitive_cargo
    FOR INSERT
    TO web, cli
    WITH CHECK (
        (SELECT COALESCE(SUM(sc.weight), 0) 
         FROM sensitive_cargo sc
         WHERE sc.flight = sensitive_cargo.flight) + sensitive_cargo.weight <= 100
    );

-- Allow all SELECT operations
CREATE POLICY allow_select_sensitive_cargo
    ON sensitive_cargo
    FOR SELECT
    TO web, cli
    USING (true);


-------------------------- DATA --------------------------

INSERT INTO airports (code, name, gps_coordinates) VALUES
    ('AER', 'Aeronautica', '41.7992, 12.5977'),  -- Rome (Urbe airport)
    ('UBO', 'Università di Bologna', '44.4969, 11.3556'),
    ('UBZ', 'Libera Università di Bolzano', '46.4969, 11.3566'),
    ('PBA', 'Politecnico di Bari', '41.1136, 16.8687'),
    ('PMI', 'Politecnico di Milano', '45.4780, 9.2284'),
    ('PTO', 'Politecnico di Torino', '45.0621, 7.6623'),
    ('URM', 'Sapienza Università di Roma', '41.9031, 12.5164'),
    ('ESE', 'Scuola Ufficiali dell''Esercito', '42.0972, 12.3778'),  -- Civitavecchia area
    ('UVE', 'Università Ca'' Foscari Venezia', '45.4336, 12.3271'),
    ('CRM', 'Università Campus Bio-Medico di Roma', '41.7996, 12.4256'),
    ('ULV', 'Università degli Studi della Campania Luigi Vanvitelli', '41.0732, 14.3328'),
    ('UAQ', 'Università degli Studi dell''Aquila', '42.3526, 13.3936'),
    ('UIN', 'Università degli Studi dell''Insubria', '45.8059, 8.8322'), -- Varese
    ('UBA', 'Università degli Studi di Bari Aldo Moro', '41.1190, 16.8690'),
    ('UBS', 'Università degli Studi di Brescia', '45.5416, 10.2127'),
    ('UCA', 'Università degli Studi di Cagliari', '39.2167, 9.1200'),
    ('UCM', 'Università degli Studi di Camerino', '43.1376, 13.0697'),
    ('UCT', 'Università degli Studi di Catania', '37.5079, 15.0830'),
    ('UFE', 'Università degli Studi di Ferrara', '44.8381, 11.6175'),
    ('UGE', 'Università degli Studi di Genova', '44.4061, 8.9339'),
    ('UME', 'Università degli Studi di Messina', '38.1938, 15.5540'),
    ('UMI', 'Università degli Studi di Milano', '45.4628, 9.1920'),
    ('UMB', 'Università degli Studi di Milano-Bicocca', '45.5094, 9.2118'),
    ('UPD', 'Università degli Studi di Padova', '45.4064, 11.8768'),
    ('UPA', 'Università degli Studi di Palermo', '38.1157, 13.3615'),
    ('UPR', 'Università degli Studi di Parma', '44.8015, 10.3279'),
    ('UPG', 'Università degli Studi di Perugia', '43.1107, 12.3908'),
    ('UTV', 'Università degli Studi di Roma Tor Vergata', '41.8535, 12.6047'),
    ('USA', 'Università degli Studi di Salerno', '40.7711, 14.7877'),
    ('UTN', 'Università degli Studi di Trento', '46.0679, 11.1211'),
    ('UUD', 'Università degli Studi di Udine', '46.0637, 13.2362'),
    ('UVR', 'Università degli Studi di Verona', '45.4384, 10.9916'),
    ('UCH', 'Università degli Studi ''Gabriele d''Annunzio'' di Chieti-Pescara', '42.3512, 14.1662'),
    ('URT', 'Università degli Studi Roma Tre', '41.8586, 12.4705'),
    ('UCL', 'Università della Calabria', '39.3645, 16.2261'),
    ('UMR', 'Università di Modena e Reggio Emilia', '44.6465, 10.9252'),
    ('UNA', 'Università di Napoli', '40.8522, 14.2681'),
    ('UPI', 'Università di Pisa', '43.7161, 10.3966'),
    ('UTO', 'Università di Torino', '45.0626, 7.6629'),
    ('UVP', 'Università Politecnica delle Marche', '43.6178, 13.5189');

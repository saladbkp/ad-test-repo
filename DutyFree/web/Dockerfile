FROM 10.10.0.11:5000/library/nginx:mainline-bookworm

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y php php-fpm php-mysql php-gd php-gmp supervisor git

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# RUN adduser --no-create-home --disabled-password --disabled-login --gecos '' cgi

RUN mkdir /app

COPY composer.json /app
COPY composer.lock /app

WORKDIR /app

RUN composer install

COPY www /app/web

COPY supervisord/supervisord.conf /supervisord.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN echo "clear_env = no" >> /etc/php/8.2/fpm/pool.d/www.conf

RUN chmod -R 755 /app
RUN chown -R nginx:nginx /app/web

COPY scripts/setup.sh /docker-entrypoint.d/99-setup.sh

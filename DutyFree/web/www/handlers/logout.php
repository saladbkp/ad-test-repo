<?php

function GET()
{
    session_destroy();

    header('Location: /');
    die;
}

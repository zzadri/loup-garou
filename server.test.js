const request = require('supertest');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const clientIo = require('socket.io-client');

// todo: create a test for the server
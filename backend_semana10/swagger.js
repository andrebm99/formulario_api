const swaggerAutogen = require('swagger-autogen')();


const doc = {
    info: {
        title: 'API alumnos',
        description: 'Documentación de la API para la gestion de alumnos.',
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./servidor.js'];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
    require('./servidor'); 
});
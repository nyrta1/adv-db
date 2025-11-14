// swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Docs",
      version: "1.0.0",
      description: "Express API with Swagger"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server"
      }
    ],

    components: {
      securitySchemes: {
        BasicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
    },
  },

  apis: ["./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

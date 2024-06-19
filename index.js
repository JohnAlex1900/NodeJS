require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const app = express();

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

// Configure morgan to log HTTP requests in 'tiny' format
morgan.token("body", (req) => JSON.stringify(req.body));
const customFormat =
  ":method :url :status :res[content-length] - :response-time ms :body";
app.use(morgan(customFormat));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name is missing" });
  }

  if (!body.number) {
    return response.status(400).json({ error: "number is missing" });
  }

  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        existingPerson.number = body.number;
        existingPerson
          .save()
          .then((updatedPerson) => {
            response.json(updatedPerson);
          })
          .catch((error) => next(error));
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });

        person
          .save()
          .then((savedPerson) => {
            response.json(savedPerson);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:name", (request, response, next) => {
  const { name } = request.params;
  const { number } = request.body;

  const opts = { new: true, runValidators: true, context: "query" };

  Person.findOneAndUpdate({ name: name }, { number: number }, opts)
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: "person not found" });
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  Person.countDocuments({}).then((count) => {
    const currentDate = new Date();
    res.send(
      `<p>Phonebook has info for ${count} people</p>
        <p>${currentDate}</p>`
    );
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

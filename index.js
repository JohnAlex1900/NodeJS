const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.static("dist"));

app.use(express.json());

// Configure morgan to log HTTP requests in 'tiny' format
app.use(morgan("tiny"));

// Custom token to log the body of POST requests
morgan.token("body", (req) => JSON.stringify(req.body));

// Custom format that includes the body of POST requests
const customFormat =
  ":method :url :status :res[content-length] - :response-time ms :body";

// Configure morgan to use the custom format
app.use(morgan(customFormat));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.statusMessage = "No person with this id exists!";
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const personName = persons.find((person) => person.name === body.name);

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (personName) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get("/info", (req, res) => {
  const totalPersons = persons.length;
  const currentDate = new Date();

  res.send(
    `<p>Phonebook has info for ${totalPersons} people</p>
       <p>${currentDate}</p>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

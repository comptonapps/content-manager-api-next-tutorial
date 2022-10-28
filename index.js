const express = require("express");
const fs = require("fs");
const cors = require("cors");
const PORT = process.env.PORT || 3001;

const app = express();

const path = require("path");
const pathToFile = path.resolve("./data.json");

const getResources = () =>  JSON.parse(fs.readFileSync(pathToFile));

const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hello World")
});

app.get("/api/resources", (req, res) => {
    const resources = getResources();
    res.send(resources);
});

app.get("/api/activeresource", (req, res) => {
    const resources = getResources();
    const activeResource = resources.find(resource => resource.status === "active");
    res.send(activeResource);
});

app.get("/api/resources/:id", (req, res) => {
    const { id } = req.params;
    const resources = getResources();
    const resource = resources.find(resource => resource.id === id);
    res.send(resource);
});

app.post("/api/resources", (req, res) => {
    const resources = getResources();
    const resource = req.body;

    resource.createdAt = new Date();
    resource.status = "inactive";
    resource.id = Date.now().toString();
    resources.unshift(resource);
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in file");
        }
        return res.send({result: resource});
    });
});

app.patch("/api/resources/:id", (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    const index = resources.findIndex(resource => resource.id === id);
    const activeResource = resources.find(resource => resource.status === 'active');

    if (resources[index].status === "complete") {
        return res.status(422).send("Cannot update completed resource")
    }

    resources[index] = req.body;
    // active related functionality
    if (req.body.status === "active") {
        if (activeResource) {
            return res.status(422).send("There is an active resource already")
        }
        resources[index].status = "active";
        resources[index].activationTime = new Date();
    }
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in file");
        }
        return res.send("update successful");
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
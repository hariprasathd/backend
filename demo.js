//const { MongoClient } = require('mongodb');
import { Collection, MongoClient } from "mongodb";
import axios from 'axios';

//const fetch = require('node-fetch');
//import fetch from 'node-fetch';

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://admin:pass@cluster0.awklxmm.mongodb.net/?retryWrites=true&w=majority";

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        //await listDatabases(client);

        //const url = 'https://latest-mutual-fund-nav.p.rapidapi.com/fetchLatestNAV?SchemeCode=130007';

        // const options = {
        //     method: 'GET',
        //     headers: {
        //         'X-RapidAPI-Key': 'c429a2d28emshb966b092b84578ep1e5955jsn785814a90b5f',
        //         'X-RapidAPI-Host': 'latest-mutual-fund-nav.p.rapidapi.com'
        //     }
        // };

        //  fetch(url, options)
        // .then(res => res.json())
        // .then(json => {
        //         await Adddocument(client,json);
        //   })
        //  .catch(err => console.error('error:' + err));

        await axios
            .get('https://latest-mutual-fund-nav.p.rapidapi.com/fetchLatestNAV', {
                params: { SchemeCode: '120717' },
                headers: {
                    'X-RapidAPI-Key': 'c429a2d28emshb966b092b84578ep1e5955jsn785814a90b5f',
                    'X-RapidAPI-Host': 'latest-mutual-fund-nav.p.rapidapi.com'
                }
            })
            .then(async (response) => {
                console.log(response.data);
                //Working Insert Many
                // const result = await client.db("mutualfund").collection("latestnav").insertMany(response.data);
                // console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
                // console.log(result.insertedIds);

                // const database = client.db("mutualfund");
                // const latestnavs = database.collection("latestnav");
                // const options = { upsert: true };

                await InsUpdateNAV(client, response.data);


                //var result = await client.db
            });
    } catch {
        console.log("There is an error in connection");
    } finally {
        //    Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

async function InsUpdateNAV(client, resp) {
    resp.forEach(async (res) => {
        Object.keys(res).forEach((key) => {
            //console.log(key);
            var replacedKey = key.replace(/\s/g, "_");
            if (key !== replacedKey) {

                //const quote_str = "'" + replacedKey + "'";
                res[replacedKey] = res[key];
                delete res[key];
            }
        });
        console.log(res);
        const filter = { Scheme_Code: `${res.Scheme_Code}` };
        console.log(filter);
        const updateDoc = {
            $set: res,
        };
        const result = await client.db("mutualfund").collection("latestnav").updateOne(filter, updateDoc, { upsert: true });
        console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,);
    });
};
/**
 * Print the names of all available databases
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

// async function Adddocument(client, json) {
//     const result = await client.db("mutualfund").collection("latestnav").insertMany(json);
//     console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
//     console.log(result.insertedIds);
// };
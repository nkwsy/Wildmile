import nextConnect from 'next-connect'
// import userValidationSchema from "../../validation/user"
import auth from '../../../middleware/auth'
import { getPlantByID, updatePlantByID } from '../../../lib/db/plants'
import NextConnectOptions from '../../../config/nextconnect'

const handler = nextConnect(NextConnectOptions)

handler
  .use(auth)
  .use(async (req, res, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get((req, res) => {
    const plant = getPlantByID(req.query.id)
    return res.json({plant})
  })
  .use(async (req, res, next) => {
    // handlers after this (PUT, DELETE) all require an authenticated user
    // This middleware to check if user is authenticated before continuing
    if (!req.user) {
      res.status(401).send('unauthenticated')
    } else {
      await next()
    }
  })
  .put((req, res) => {
    const { scientific_name, common_name, notes, image_url, synonyms } = req.body
    const plant = updatePlantByID(req, req.query.id, {
        scientific_name: scientific_name,
        common_name: common_name,
        notes: notes,
        image_url: image_url,
        synonyms: synonyms
     })
    return res.json({ plant })
  })

  export default handler
const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');


router.post('/tags', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.first()
    .from('tags')
    .where('name', name)
    .then( item => {
      if(item) {
        const err = new Error('Unable to submit duplicate requests');
        err.status = 409;
        return next(err);
      }
      return knex.insert(newItem)
        .into('tags')
        .returning(['id', 'name']);
    })
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.get('/tags', (req, res, next) => {
  knex.select()
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});


router.get('/tags/:id', (req, res, next) => {
  const { id } = req.params;

  knex.first()
    .from ('tags')
    .where('id', id)
    .then(item => {
      if(item) res.json(item);
      else next();
    })
    .catch(err => next(err));
});

router.put('/tags/:id', (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body; 
  const updateObj = {name,};
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex.first()
    .from('tags')
    .where('name', name)
    .then( item => {
      if(item) {
        const err = new Error('Unable to submit duplicate requests');
        err.status = 409;
        return next(err);
      }
      return knex('folders')
        .where('id', `${id}`)
        .update(updateObj)
        .returning('name');
    }).then(name => {
      if (name) res.json(name);
      else next();
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/tags/:id', (req, res, next) => {
  const id = req.params.id;
  knex('tags')
    .del()
    .where('id', `${id}`)
    .then(() => res.sendStatus(204))
    .catch(err => {
      next(err);
    });
});


module.exports = router;

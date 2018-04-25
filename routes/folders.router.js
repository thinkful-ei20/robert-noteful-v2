'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
router.get('/folders', (req, res, next) => {

  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
  
});

// Get a single item
router.get('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('id', 'name')
    .from('folders')
    .where('id', `${id}`)
    .orderBy('id')
    .then(item => {
      if (item.length) res.json(item[0]);
      else next();
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/folders/:id', (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body; 
  const updateObj = {name,};
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .where('id', `${id}`)
    .update(updateObj)
    .returning('name')
    .then(name => {
      if (name) res.json(name);
      else next();
    })
    .catch(err => {
      next(err);
    });
});

// Post (insert) an item
router.post('/folders', (req, res, next) => {
  const { name } = req.body;

  const newItem = { name, };
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex('folders')
    .insert(newItem)
    .returning(['id', 'name'])
    .then(folder => {
      if (folder) res.location(`http://${req.headers.host}/notes/${folder[0].id}`).status(201).json(folder);
    })
    .catch(err => {
      next(err);
    });
});

// Delete an item
router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
    .where('id', `${id}`)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => {
      next(err);
    });
});

module.exports = router;

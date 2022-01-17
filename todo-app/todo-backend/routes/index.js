const express = require('express');
const router = express.Router();
const { getAsync, setAsync } = require('../redis');

const configs = require('../util/config')

let visits = 0

/* GET index data. */
router.get('/', async (req, res) => {
  visits++

  res.send({
    ...configs,
    visits
  });
});

router.get('/statistics', async (_, res) => {
  let numberOfTodos = await getAsync('number-of-todos')
  if (!numberOfTodos) {
    await setAsync('number-of-todos', '0')
    numberOfTodos = 0
  }
  const numberOfTodosObj = {
    "added_todos": parseInt(numberOfTodos)
  }
  res.json(numberOfTodosObj);
});

module.exports = router;

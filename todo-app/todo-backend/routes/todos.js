const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const { getAsync, setAsync } = require('../redis');

/* GET todos listing.  */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  const numberOfTodos = await getAsync('number-of-todos')
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  const numberOfTodos = await getAsync('number-of-todos')
  if (numberOfTodos) {
    await setAsync('number-of-todos', parseInt(numberOfTodos) + 1)
  } else {
    await setAsync('number-of-todos', 1)
  }
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}
router.use('/:id', findByIdMiddleware, singleRouter)

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
router.get('/:id', async (req, res) => {
  const todo = await req.todo
  if (todo) {
    res.send(todo)
  } else {
    console.log('in else')
    res.status(404).end()
  }
});

/* PUT todo. */
singleRouter.put('/:id', async (req, res) => {
  const newTodo = req.todo
  const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, newTodo, { new: true })
  if (updatedTodo) {
    res.json(updatedTodo)
  } else {
    res.status(404).end()
  }
});


module.exports = router;

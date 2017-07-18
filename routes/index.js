const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const mathew = {
    name: "mathew",
    age: 29,
    cool: true
  }
  //to access url queries like http://localhost:7777/?name=mathew&age=29
  // res.send(req.query.name);
  //or to format all of the queries as json
  // res.json(req.query);
  // res.json(mathew);
  res.render('hello', {
    name: 'mathew',
    pet: req.query.pet || 'stevie',
    title: 'fuck this shit'
  });
});

router.get('/reverse/:words', (req, res) => {
  const reverse = [...req.params.words].reverse().join('');
  res.send(reverse);
})

module.exports = router;

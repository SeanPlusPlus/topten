import { useCallback, useState, useEffect } from 'react'
import update from 'immutability-helper'
import axios from 'axios'
import _orderBy from 'lodash/orderBy'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import { Card } from './Card'

const style = {
  width: '100%',
  maxWidth: '600px'
}

export const Container = () => {
  const [show, setShow] = useState(false)
  const [score, setScore] = useState(null)

  const handleClose = () => setShow(false)
  
  const [cards, setCards] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/data');
      const data = response.data
      setCards(data)
    }

    fetchData()
  }, [])

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setCards((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    )
  }, [])

  const renderCard = useCallback((card, index) => {
    return (
      <Card
        key={card.id}
        index={index}
        id={card.id}
        text={card.text}
        moveCard={moveCard}
      />
    )
  }, [])

  const handleSubmit = () => {
    setCards(cards.map((c, i) => ({...c, order: i + 1})))

    console.log(cards)

    let score = 0
    cards.forEach((card, idx) => {
      const prediction = idx + 1
      if (prediction === card.rank && card.rank <= 10) {
        score += prediction
      }

      setScore(score)
    })

    setShow(true)
  }

  const Info = (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Score: <code>{score}</code></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="results">
          {_orderBy(cards, ['rank']).map((card, i) => (
            <li key={i}>
              {i+1}: <span className={(card.rank <= 10 && (card.order !== card.rank)) ? 'incorrect' : 'correct'}>{card.text}</span> {card.order < 10 && `[${card.order}]`}
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

  return (
    <>
      <div style={style}>
        {cards.map((card, i) => renderCard(card, i))}
      </div>
      <div className='submit'>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="lg"
        >
          Submit
        </Button>
      </div>
      {Info}
    </>
  )
}

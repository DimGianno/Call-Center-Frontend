import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import mockCalls from './data/calls'


function App() {
  const [calls, setCalls] = useState(mockCalls)

  return (
    <>
      <div>
        <h1>Call Center Dashboard</h1>
      </div>
      <div>
        {calls
        .filter((call) => call.is_archived === false)
        .map((call) => {
          return (
            <div key={call.id} className="call-card">
              <p><strong>direction:</strong> {call.direction}</p>
              <p><strong>from:</strong> {call.from}</p>
              <p><strong>to:</strong> {call.to}</p>
              <p><strong>call_type:</strong> {call.call_type}</p>
              <p><strong>duration:</strong> {call.duration} seconds</p>
              <p><strong>is_archived:</strong> {call.is_archived.toString()}</p>
              <p><strong>created_at:</strong> {call.created_at}</p>
              <p><strong>notes:</strong> {call.notes?.length > 0 ? call.notes[0].content : 'No notes'}</p>
            </div>
        )
        })}  
      </div>
    </>
  )
}

export default App

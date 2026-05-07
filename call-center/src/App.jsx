import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import mockCalls from './data/calls'
import CallItem from './components/CallItem'


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
            return <CallItem key={call.id} call={call} />
          })}
      </div>
    </>
  )
}

export default App

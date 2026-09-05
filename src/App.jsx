import { useState } from 'react'
import './App.css'

function App() {
  const [keyword, setKeyword] = useState('')
  const [cveResults, setCveResults] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const searchCVE = async () => {
    setLoading(true)
    setExplanation('')
    try {
      const response = await fetch(`http://localhost:3001/api/cve/${keyword}`)
      const data = await response.json()
      setCveResults(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const explainCVE = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveData: cveResults }),
      })
      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>🛡️ Security Vulnerability Checker</h1>

      <input
        type="text"
        placeholder="Search a keyword (e.g. log4j, wordpress)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ padding: '8px', width: '300px', marginRight: '10px' }}
      />
      <button onClick={searchCVE} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {cveResults && (
        <div style={{ marginTop: '20px' }}>
          <h3>Found {cveResults.totalResults} results (showing top 5)</h3>
          <button onClick={explainCVE} disabled={loading}>
            {loading ? 'Thinking...' : '🤖 Explain with AI'}
          </button>

          {explanation && (
            <div style={{ background: '#f0f0f0', padding: '15px', marginTop: '15px', borderRadius: '8px' }}>
              <strong>AI Explanation:</strong>
              <p>{explanation}</p>
            </div>
          )}

          <pre style={{ background: '#1e1e1e', color: '#0f0', padding: '15px', overflow: 'auto', marginTop: '15px' }}>
            {JSON.stringify(cveResults.vulnerabilities?.map(v => ({
              id: v.cve.id,
              description: v.cve.descriptions[0]?.value
            })), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
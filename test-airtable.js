// Test Airtable connection
const testData = {
  session_id: `test_${Date.now()}`,
  step: "test_connection",
  step_index: 0,
  user_name: "Test User",
  ambition_gap: "Testing Airtable connection",
  flow_version: "1.0.0",
  timestamp: new Date().toISOString(),
  progress: "0/1"
}

fetch('/api/airtable', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ data: testData })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Airtable test successful:', data)
  alert('Airtable connection working! Check console for details.')
})
.catch(error => {
  console.error('❌ Airtable test failed:', error)
  alert('Airtable connection failed. Check console for details.')
})

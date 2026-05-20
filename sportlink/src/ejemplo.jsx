import { supabase } from './utils/supabase.js'
import { useState, useEffect } from 'react'

function App() {

const [productos, setProductos] = useState([])

  useEffect(() => {
    async function getProductos() {
      const { data, error } = await supabase
        .from('entrenadores')
        .select('*')
        
      if (data) {
        setProductos(data)
        console.log(data)
      }

      if (error) {
        console.log(error)
      }
    }

    getProductos()
  }, [])

 

  return (
  <h1>-</h1>
  )
}

export default App
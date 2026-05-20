import { supabase } from './utils/supabase.js'
import { useState, useEffect } from 'react'

//const [productos, setProductos] = useState([])

  //useEffect(() => {
    //async function getProductos() {
      //const { data, error } = await supabase
        //.from('entrenadores')
        //.select('*')
        
      //if (data) {
        //setProductos(data)
        //console.log(data)
      //}

      //if (error) {
       // console.log(error)
     // }
   // }

    //getProductos()
  //}, [])


async function buscarUser(mail,contraseña) {
    const { data, error} = await supabase
    .from('usuarios')
    .select('*')
    eq('email', mail)
    .eq('contraseña', contraseña);

    if(error){
        console.log(error)
        return null
    }

    if(data.length === 0){
        
        return null
    }

    return data

}

  return (
  <h1>-</h1>
  )


export default App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState } from 'react';
import './Nav.css'

function Nav() {
const [menuAbierto, setMenuAbierto] = useState(false);
const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
};


    return(
        <>
        <nav>
            <button className='hamburguesa' onClick={toggleMenu}>&#9776;</button>
            <div className={`lista ${menuAbierto ? 'mostrar' : ''}`}>
                <ol>
                    <li><a href="">Pista</a></li>
                    <li><a href="">Reiniciar</a></li>
                    <li><a href="">Configuracion</a></li>
                </ol>
            </div>
        </nav>
        </>
    )
}

export default Nav
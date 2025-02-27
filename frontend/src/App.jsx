import HomePage from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';


function App() {


  return (
    <>
     <Toaster/>
      <BrowserRouter>
        <Routes>
       
          <Route path='/' element={
            <DashboardLayout>
                <HomePage/>
            </DashboardLayout>
          }/>
       
        
         
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App



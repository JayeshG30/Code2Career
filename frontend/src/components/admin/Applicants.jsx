import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicationTable from './ApplicationTable'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setAllApplications } from '@/redux/applicationSlice'
import { toast } from 'sonner'

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const {applications} = useSelector(store => store.application)
    useEffect(() => {
        const fetchAllApplications = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/applicants/${params.id}`, {withCredentials: true})
                console.log(res.data.data)
                if(res.data.success){
                    dispatch(setAllApplications(res.data.data))
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchAllApplications();
    }, [])
  return (
    <div>
      <Navbar/>
      <div className='max-w-7xl mx-auto'>
        <h1 className='font-bold text-xl my-5'>Applicants ({applications?.length})</h1>
        <ApplicationTable/>
      </div>
    </div>
  )
}

export default Applicants

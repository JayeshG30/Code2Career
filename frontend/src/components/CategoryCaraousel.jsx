import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSearchedQuery } from '@/redux/jobSlice'

const categories = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "Fullstack Developer"
]

const CategoryCaraousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/browse")
  } 
  return (
    <div>
      <Carousel className="w-full max-w-xl mx-auto my-16">
        <CarouselContent>
            {
                categories.map((category, index) => (
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={index}>
                        <Button onClick={() => searchJobHandler(category)} variant="outline" className="rounded-full">{category}</Button>
                    </CarouselItem>
                ))
            }
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </div>
  )
}

export default CategoryCaraousel

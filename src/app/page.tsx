'use client'
import Image from "next/image";
import Navbar from "./components/Navbar";
import {useQuery} from 'react-query'
import axios from 'axios'
import { format } from "date-fns";
import {parseISO} from "date-fns"
import Container from "./components/Container";
import KelvinToCelsius from './utils/KelvinToCelsius'
import WeatherIcon from "./components/WeatherIcon";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import { metersToKilometers } from "./utils/metersToKilometers";
import WeatherDetails from "./components/WeatherDetails";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";
interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}
export default function Home() {
  const[place, setPlace] = useAtom(placeAtom)
  const[loadingCity, setLoadingCity]=useAtom(loadingCityAtom)

  const { isLoading, error, data, refetch } = useQuery<WeatherData>
  ('repoData',async() =>{
    const {data}= await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=6e6a1e6c86d62e3e8adb6c46cfa5eac5&cnt=56`)
    return data ;
  }
  )
  useEffect(()=>{
    refetch()
  },[place, refetch])

  const firstData = data?.list[0];
  console.log(data)

  if (isLoading) return 'Loading...'
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
     <Navbar location={data?.city.name}/>
     <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
      <> {loadingCity? <WeatherSkeleton/> :
      <section className="space-y-4">
        <div className="space-y-2"> 
          
            <h2 className="flex  gap-1 text-2xl items-end">
            <p>{format(parseISO(firstData?.dt_txt ?? ''),'EEEE')} </p> 
            {/*  EEEE is the code for full name of days in week  */}
            <p className="text-lg"> ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yy")})</p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4 ">  
                <span className="text-5xl">
                {KelvinToCelsius(firstData?.main.temp ?? 0)}°
                </span>{/* if there is no main.temp present 0 should be displayed . option-shift-8 for the degree symbol*/}
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span> Feels like </span>
                  <span>
                      {KelvinToCelsius(firstData?.main.feels_like ?? 0)}
                  </span>
                 </p>
                 <p className="text-xs space-x-2 whitespace-nowrap">
                  <span>
                  {KelvinToCelsius(firstData?.main.temp_min ?? 0)}°↓
                  {" "}
                  </span>
                  <span>
                    {" "}
                    {KelvinToCelsius(firstData?.main.temp_max ?? 0)}° ↑
                  </span>
                 </p>
              </div>
              {/* time and weatehr icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3 ">
                {data?.list.map((d,i)=>
                <div key={i}
                className="flex flex-col justify-between gap-2 items-center text-xs font-semibold "
                >
                  <p className="whitespace-nowrap">
                    {format(parseISO(d.dt_txt), "h:mm a")}
                  </p>

                  <WeatherIcon iconName={d.weather[0].icon}/>

                  <p> {KelvinToCelsius(d?.main.temp?? 0)}°</p>
                </div>
                )}
              </div>
            </Container>
        </div>
        <div className=" flex gap-4">
                {/* left  */}
                <Container className="w-fit  justify-center flex-col px-4 items-center ">
                  <p className=" capitalize text-center">
                    {firstData?.weather[0].description}{" "}
                  </p>
                  <WeatherIcon
                    iconName={
                      firstData?.weather[0].icon ?? ""
                    }
                  />
                </Container>
                <Container className="bg-purple-300/80  px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visability={metersToKilometers(
                      firstData?.visibility ?? 10000
                    )}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(data?.city.sunrise ?? 1702949452, "H:mm")}
                    // sunrise={}
                    sunset={format(data?.city.sunset ?? 1702517657, "H:mm")}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                  />
                </Container>
                </div>
      </section>}
      </>
       </main>
    </div>
  );
}


function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      {/* Today's data skeleton */}
      <div className="space-y-2 animate-pulse">
        {/* Date skeleton */}
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Time wise temperature skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      </section>)}
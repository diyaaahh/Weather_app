

export default function KelvinToCelsius(tempInKelvin : number):number {
    const tempInCelsius = tempInKelvin - 273.15;
    return Math.floor(tempInCelsius) //only returns integer value

}
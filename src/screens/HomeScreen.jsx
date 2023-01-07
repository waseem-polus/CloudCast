import React, { useCallback } from 'react'
import { useEffect, useState } from 'react'

import { CityListItem } from '../components/CityListItem'
import CityDetailedItem from '../components/CityDetailedItem'
import TitledSection from '../components/TitledSection'

import { API_KEY } from '@env'
import { SafeAreaScreenWrapper } from '../components/ScreenWrapper'
import Font from '../components/Font'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { Colors } from '../components/GlobalVars'
import { useFocusEffect } from '@react-navigation/native'

async function getLocation(setGPSWeather) {
  let { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    setGPSWeather(undefined)
    return
  }

  let location = await Location.getCurrentPositionAsync({})

  getLocationWeather(setGPSWeather, location)
}

function getLocationWeather(setGPSWeather, location) {
  fetch(
    'https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=' +
      location.coords.latitude +
      '&lon=' +
      location.coords.longitude +
      '&appid=' +
      API_KEY +
      '&units=imperial&cnt=1',
  )
    .then((res) => res.json())
    .then((wthr) => setGPSWeather(wthr))
}

async function fetchBookmarkedWeather(setFavWeather) {
  try {
    AsyncStorage.getItem('Favorites')
      .then((res) => JSON.parse(res))
      .then((favs) => {
        if (favs != undefined) {
          let weather = []
          for (let i = 0; i < favs.length; i++) {
            let city = favs[i]

            weather.push(
              fetch(
                'https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=' +
                  city.lat +
                  '&lon=' +
                  city.lon +
                  '&appid=' +
                  API_KEY +
                  '&units=imperial&cnt=1',
              ).then((res) => res.json()),
            )
          }

          Promise.all(weather).then((wthr) => setFavWeather(wthr))
        } else {
          AsyncStorage.setItem('Favorites', JSON.stringify([]))
          setFavWeather(undefined)
        }
      })
  } catch (e) {
    console.err(e)
  }
}

async function fetchData(setGPSWeather, setFavWeather) {
  await getLocation(setGPSWeather)
  fetchBookmarkedWeather(setFavWeather)
}

export default function HomeScreen({ navigation }) {
  const [GPSweather, setGPSWeather] = useState()
  const [FavWeather, setFavWeather] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchBookmarkedWeather(setFavWeather).then(() => setRefreshing(false))
  }, [])

  useEffect(() => {
    fetchData(setGPSWeather, setFavWeather)
  }, [])

  useFocusEffect(useCallback(() => {
    fetchBookmarkedWeather(setFavWeather)
  }, []))

  let citylistItems = (
    <TitledSection Label={'Favorite Cities'}>
      {FavWeather != undefined && FavWeather.length > 0 ? (
        FavWeather.map((cityWeather) => {
          return (
            <CityListItem
              key={cityWeather.city.name}
              Weather={cityWeather}
              Action={() => {
                navigation.navigate('City', { CityName: cityWeather.city.name, Lon: cityWeather.city.coord.lon, Lat: cityWeather.city.coord.lat })
              }}
            ></CityListItem>
          )
        })
      ) : (
        <Font style={styles.noFavsText}>No favorites added...</Font>
      )}
    </TitledSection>
  )

  let gps
  if (GPSweather != undefined) {
    gps = (
      <CityDetailedItem
        Weather={GPSweather}
        Action={() => {
          navigation.navigate('City', { CityName: GPSweather.city.name, Lon: GPSweather.city.coord.lon, Lat: GPSweather.city.coord.lat })
        }}
      ></CityDetailedItem>
    )
  }

  let colors = Colors._z

  return (
    <SafeAreaScreenWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl tintColor={colors.gradient[0]} progressBackgroundColor={colors.text} colors={colors.gradient} refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {gps}
        {citylistItems}
      </ScrollView>
    </SafeAreaScreenWrapper>
  )
}

const styles = StyleSheet.create({
  noFavsText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 24,
  },
})

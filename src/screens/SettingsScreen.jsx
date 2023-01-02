import React from 'react'
import { StyleSheet, Alert, Linking } from 'react-native'

import TitledSection from '../components/TitledSection'
import { OpenDialogue } from '../components/SettingItem'
import Button from '../components/Button'
import {SafeAreaScreenWrapper} from '../components/ScreenWrapper'

import AsyncStorage from '@react-native-async-storage/async-storage'

async function deleteSaves() {
  try {
    await AsyncStorage.setItem('Favorites', JSON.stringify([]))
    console.log(await AsyncStorage.getItem('Favorites'))
  } catch (e) {
    console.log('[ERROR]', e.message)
  }
}

const deleteSavesDialogue = () =>
  Alert.alert(
    'Are you sure?',
    'If you delete saves, we will not be able to recover them anymore',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'Delete Favorites', onPress: () => deleteSaves() },
    ],
    {
      cancelable: true,
    },
  )

export default function SettingsScreen() {
  return (
    <SafeAreaScreenWrapper>
      <TitledSection Label={'Privacy'}>
        <OpenDialogue
          SettingName={'Location'}
          Description={'On'}
          Icon={require('../../assets/icons/Location.png')}
          Action={() => {Linking.openSettings()}}
        />
      </TitledSection>

      <TitledSection Label={'Units'}>
        <OpenDialogue
          SettingName={'Temperature'}
          Description={'Fahrenheit'}
          Icon={require('../../assets/icons/Thermometer.png')}
        />
        <OpenDialogue
          SettingName={'Length'}
          Description={'Miles'}
          Icon={require('../../assets/icons/Ruler.png')}
        />
        <OpenDialogue
          SettingName={'Pressure'}
          Description={'Atm'}
          Icon={require('../../assets/icons/Pressure.png')}
        />
      </TitledSection>

      <TitledSection Label={'Danger Zone'}>
        <Button Label={'Remove All Favorites'} Action={deleteSavesDialogue}></Button>
      </TitledSection>
    </SafeAreaScreenWrapper>
  )
}

const styles = StyleSheet.create({
  settingsContainer: {
    backgroundColor: '#39393920',
    borderRadius: 10,
    flexGrow: 1,
  },
})

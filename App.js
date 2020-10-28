import React from 'react'
import {
  Platform,
  TouchableHighlight,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
} from 'react-native'

import Zoom from 'react-native-facetec-zoom'
import deviceKeyIdentifier from './device-key-identifier'

const BigText = ({ children, style }) => <Text style={[styles.bigText, style]}>{children}</Text>

const Button = ({ children, ...props }) => (
  <TouchableHighlight {...props} style={styles.button}>
    <Text style={[styles.hugeText, styles.buttonText]}>{children}</Text>
  </TouchableHighlight>
)

const prettify = (obj) => (obj ? JSON.stringify(obj, null, 2) : '')
// don't actually do this
const getFaceID = () => String(Math.random()).split('.')[1]

export default class App extends React.Component {
  state = {}
  init = async () => {
    const { success, status } = await Zoom.initialize({
      deviceKeyIdentifier,
      showPreEnrollmentScreen: false,
      showUserLockedScreen: false,
      showRetryScreen: false,
      topMargin: 200,
      // sizeRatio: 0.7,
      centerFrame: false,
      returnBase64: false,
    })

    if (!success) {
      // see constants.js SDKStatus for explanations of various
      // reasons why initialize might not have gone through
      throw new Error(`failed to init. SDK status: ${status}`)
    }

    this.initialized = true
  }

  enroll = async () => {
    if (!this.initialized) await this.init()

    const faceID = getFaceID()
    this.setState({ faceID })

    // launch Zoom's enrollment process
    return Zoom.enroll({
      id: faceID,
    }).then(this.setResult, this.setError)
  }

  authenticate = async () => {
    if (!this.initialized) await this.init()

    // launch Zoom's enrollment process
    return Zoom.authenticate({
      id: this.state.faceID,
    }).then(this.setResult, this.setError)
  }

  verifyLiveness = async () => {
    if (!this.initialized) await this.init()

    // launch Zoom's verification process
    return Zoom.verifyLiveness().then(this.setResult, this.setError)
  }

  setResult = (result) => this.setState({ result })
  setError = (error) => this.setState({ error })

  render = () => {
    return (
      <View style={styles.container}>
        <BigText>Operations:</BigText>
        <Button onPress={this.verifyLiveness}>Verify Liveness</Button>
        <Button onPress={this.enroll}>Enroll</Button>
        {this.state.faceID && <Button onPress={this.authenticate}>Authenticate</Button>}
        {this.state.result && (
          <>
            <BigText>Result:</BigText>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <BigText>{prettify(this.state.result)}</BigText>
            </ScrollView>
          </>
        )}
        {this.state.error && (
          <>
            <BigText>Error:</BigText>
            <BigText>{prettify(this.state.error)}</BigText>
          </>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  scrollContainer: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: 'blue',
    fontSize: 30,
  },
  bigText: {
    fontSize: 20,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
    minWidth: 300,
    minHeight: 300,
  },
})

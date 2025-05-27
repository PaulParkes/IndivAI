import React from 'react';
import {
  Button,
  ExpoImage,
  IconButton,
  LoadingIndicator,
  ScreenContainer,
  SimpleStyleFlatList,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Modal, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { imagePtompts: null };

const GenerationResultsScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [generatedImages, setGeneratedImages] = React.useState({
    artifacts: [
      { seed: null, base64: '', finishReason: null },
      { seed: null, base64: '', finishReason: null },
      { seed: null, base64: '', finishReason: null },
      { seed: null, base64: '', finishReason: null },
      { seed: null, base64: '', finishReason: null },
      { seed: null, base64: '', finishReason: null },
    ],
  });
  const [imagesNotReady, setImagesNotReady] = React.useState([true, false]);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState('');
  const generateImages = async prompts => {
    //Ammended from https://platform.stability.ai/docs/api-reference#tag/SDXL-1.0-and-SD1.6/operation/textToImage
    const engineId = 'stable-diffusion-v1-6';
    const apiHost = 'https://api.stability.ai';
    const apiKey = 'sk-qlbJS92awR3LyLLPD5TevHuT02ztHRFABGYjxRc8NMtxUQeh';
    if (prompts) {
      try {
        const response = await fetch(
          `${apiHost}/v1/generation/${engineId}/text-to-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: prompts,
                  weight: 0.5,
                },
              ],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              steps: 29,
              samples: 6,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`Non-200 response: ${await response.text()}`);
        } else {
          const responseJSON = await response.json();
          setImagesNotReady([false, true]);
          setGeneratedImages(responseJSON);
        }
      } catch (error) {
        console.error('Failed to generate Images', error);
      }
    } else {
      console.log('No prompts passed');
    }
  };
  React.useEffect(() => {
    const handler = async () => {
      try {
        await generateImages(params?.imagePtompts ?? defaultProps.imagePtompts);
      } catch (err) {
        console.error(err);
      }
    };
    handler();
  }, []);

  return (
    <ScreenContainer 
      scrollable={false} 
      hasSafeArea={true}
      style={StyleSheet.applyWidth({ backgroundColor: 'rgb(252, 252, 252)' }, dimensions.width)}
    >
      {/* Background */}
      <View
        pointerEvents={'box-none'}
        style={StyleSheet.applyWidth(
          {
            borderRadius: 15,
            borderWidth: 10,
            flex: 1,
            justifyContent: 'space-evenly',
            margin: 15,
          },
          dimensions.width
        )}
      >
        <Text
          accessible={true}
          selectable={false}
          {...GlobalStyles.TextStyles(theme)['Text'].props}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.TextStyles(theme)['Text'].style,
              theme.typography.body1,
              { alignSelf: 'center', fontSize: 33, marginTop: 30 }
            ),
            dimensions.width
          )}
        >
          {'Generation Results'}
        </Text>
        <SimpleStyleFlatList
          data={generatedImages?.artifacts}
          decelerationRate={'normal'}
          inverted={false}
          keyExtractor={(listData, index) =>
            listData?.id ??
            listData?.uuid ??
            index?.toString() ??
            JSON.stringify(listData)
          }
          keyboardShouldPersistTaps={'never'}
          listKey={'Background->List'}
          nestedScrollEnabled={false}
          numColumns={1}
          onEndReachedThreshold={0.5}
          pagingEnabled={false}
          renderItem={({ item, index }) => {
            const listData = item;
            return (
              <>
                {/* Select Image Or Open Modal */}
                <Touchable
                  onLongPress={() => {
                    try {
                      setSelectedImage(listData?.base64);
                      setOpenModal(true);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  onPress={() => {
                    try {
                      setSelectedImage(listData?.base64);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <>
                    {!(imagesNotReady && imagesNotReady[1]) ? null : (
                      <ExpoImage
                        allowDownscaling={true}
                        cachePolicy={'disk'}
                        contentPosition={'center'}
                        transitionDuration={300}
                        transitionEffect={'cross-dissolve'}
                        transitionTiming={'ease-in-out'}
                        {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
                        resizeMode={'cover'}
                        source={imageSource(
                          `data:image/png;base64,${listData?.base64}`
                        )}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                            {
                              borderWidth: 5,
                              height: 120,
                              marginBottom: 5,
                              marginLeft: 5,
                              marginRight: 5,
                              marginTop: 5,
                              width: 120,
                            }
                          ),
                          dimensions.width
                        )}
                      />
                    )}
                  </>
                  <>
                    {!(imagesNotReady && imagesNotReady[0]) ? null : (
                      <View
                        style={StyleSheet.applyWidth(
                          {
                            alignItems: 'center',
                            height: 120,
                            margin: 5,
                            width: 120,
                          },
                          dimensions.width
                        )}
                      >
                        <>
                          {!(imagesNotReady && imagesNotReady[0]) ? null : (
                            <LoadingIndicator
                              size={30}
                              type={'circleFade'}
                              color={theme.colors.text.strong}
                            />
                          )}
                        </>
                      </View>
                    )}
                  </>
                </Touchable>
              </>
            );
          }}
          snapToAlignment={'start'}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={StyleSheet.applyWidth(
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            },
            dimensions.width
          )}
        />
        {/* Buttons */}
        <View
          pointerEvents={'box-none'}
          style={StyleSheet.applyWidth(
            {
              alignContent: 'flex-start',
              alignItems: [
                { minWidth: Breakpoints.Mobile, value: 'flex-start' },
                { minWidth: Breakpoints.Tablet, value: 'center' },
              ],
              alignSelf: [
                { minWidth: Breakpoints.Mobile, value: 'auto' },
                { minWidth: Breakpoints.Tablet, value: 'auto' },
              ],
              flexDirection: 'row',
              justifyContent: [
                { minWidth: Breakpoints.Mobile, value: 'space-evenly' },
                { minWidth: Breakpoints.Tablet, value: 'space-around' },
              ],
            },
            dimensions.width
          )}
        >
          {/* Accept */}
          <Button
            accessible={true}
            iconPosition={'left'}
            onPress={() => {
              try {
                setOpenModal(true);
              } catch (err) {
                console.error(err);
              }
            }}
            {...GlobalStyles.ButtonStyles(theme)['Button'].props}
            activeOpacity={0.6}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.ButtonStyles(theme)['Button'].style,
                theme.typography.button,
                {
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 5,
                  color: 'rgb(0, 0, 0)',
                  height: 50,
                  width: 100,
                }
              ),
              dimensions.width
            )}
            title={'ACCEPT'}
          />
          {/* Retry */}
          <Button
            accessible={true}
            iconPosition={'left'}
            onPress={() => {
              const handler = async () => {
                try {
                  const currentValueSetVariable0 = imagesNotReady;
                  if (
                    typeof currentValueSetVariable0 !== 'object' &&
                    !Array.isArray(currentValueSetVariable0)
                  ) {
                    console.warn(
                      'Can only set path on object or array values, skipping...'
                    );
                    return;
                  }
                  const updatedValueSetVariable0 = Array.isArray(
                    currentValueSetVariable0
                  )
                    ? [...currentValueSetVariable0]
                    : { ...currentValueSetVariable0 };
                  updatedValueSetVariable0[0] = true;
                  setImagesNotReady(updatedValueSetVariable0);

                  const currentValueSetVariable01 = imagesNotReady;
                  if (
                    typeof currentValueSetVariable01 !== 'object' &&
                    !Array.isArray(currentValueSetVariable01)
                  ) {
                    console.warn(
                      'Can only set path on object or array values, skipping...'
                    );
                    return;
                  }
                  const updatedValueSetVariable01 = Array.isArray(
                    currentValueSetVariable01
                  )
                    ? [...currentValueSetVariable01]
                    : { ...currentValueSetVariable01 };
                  updatedValueSetVariable01[1] = false;
                  setImagesNotReady(updatedValueSetVariable01);
                  await generateImages(
                    params?.imagePtompts ?? defaultProps.imagePtompts
                  );
                } catch (err) {
                  console.error(err);
                }
              };
              handler();
            }}
            {...GlobalStyles.ButtonStyles(theme)['Button'].props}
            activeOpacity={0.6}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.ButtonStyles(theme)['Button'].style,
                theme.typography.button,
                {
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 5,
                  color: 'rgb(16, 13, 13)',
                  height: 50,
                  width: 100,
                }
              ),
              dimensions.width
            )}
            title={'RETRY'}
          />
        </View>
        {/* Generated Image */}
        <View
          pointerEvents={'box-none'}
          style={StyleSheet.applyWidth(
            {
              alignItems: [
                { minWidth: Breakpoints.Mobile, value: 'flex-start' },
                { minWidth: Breakpoints.Tablet, value: 'center' },
              ],
              alignSelf: 'auto',
              flexDirection: 'row',
              justifyContent: [
                { minWidth: Breakpoints.Mobile, value: 'space-evenly' },
                { minWidth: Breakpoints.Tablet, value: 'space-around' },
              ],
              margin: 10,
            },
            dimensions.width
          )}
        />
        {/* Enlarge Image Modal */}
        <Modal
          animationType={'none'}
          supportedOrientations={['portrait', 'landscape']}
          transparent={true}
          visible={Boolean(openModal)}
        >
          <View
            style={StyleSheet.applyWidth(
              { flex: 1, height: '33.33%' },
              dimensions.width
            )}
          >
            <Touchable
              onPress={() => {
                try {
                  setOpenModal(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              style={StyleSheet.applyWidth(
                { height: '33.33%' },
                dimensions.width
              )}
            />
            <View
              pointerEvents={'box-none'}
              style={StyleSheet.applyWidth(
                { height: '33.33%', zIndex: 1 },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor: theme.colors.text.light,
                    borderColor: theme.colors.text.strong,
                    borderWidth: 5,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    marginLeft: 10,
                    marginRight: 10,
                  },
                  dimensions.width
                )}
              >
                <View
                  pointerEvents={'box-none'}
                  style={StyleSheet.applyWidth(
                    { alignItems: 'flex-end' },
                    dimensions.width
                  )}
                >
                  {/* Close Enlarge Image Modal */}
                  <IconButton
                    onPress={() => {
                      try {
                        setOpenModal(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    size={32}
                    color={theme.colors.text.strong}
                    icon={'AntDesign/close'}
                  />
                </View>

                <View
                  pointerEvents={'box-none'}
                  style={StyleSheet.applyWidth(
                    { alignItems: 'center', flexDirection: 'column' },
                    dimensions.width
                  )}
                >
                  {/* Enlarged Image */}
                  <ExpoImage
                    allowDownscaling={true}
                    cachePolicy={'disk'}
                    contentPosition={'center'}
                    resizeMode={'cover'}
                    transitionDuration={300}
                    transitionEffect={'cross-dissolve'}
                    transitionTiming={'ease-in-out'}
                    {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
                    source={imageSource(
                      `data:image/png;base64,${selectedImage}`
                    )}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                        { height: 300, width: 300 }
                      ),
                      dimensions.width
                    )}
                  />
                </View>
                {/* View 2 */}
                <View pointerEvents={'box-none'}>
                  {/* Confirm selection */}
                  <Button
                    accessible={true}
                    iconPosition={'left'}
                    onPress={() => {
                      console.log('Confirm selection ON_PRESS Start');
                      let error = null;
                      try {
                        console.log('Start ON_PRESS:0 SET_VARIABLE');
                        setOpenModal(false);
                        console.log('Complete ON_PRESS:0 SET_VARIABLE');
                        console.log('Start ON_PRESS:1 NAVIGATE');
                        navigation.navigate('StackNavigator', {
                          screen: 'CharacterCreationScreen',
                          params: { Image_file_path: selectedImage },
                        });
                        console.log('Complete ON_PRESS:1 NAVIGATE');
                      } catch (err) {
                        console.error(err);
                        error = err.message ?? err;
                      }
                      console.log(
                        'Confirm selection ON_PRESS Complete',
                        error ? { error } : 'no error'
                      );
                    }}
                    {...GlobalStyles.ButtonStyles(theme)['Button'].props}
                    activeOpacity={0.6}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.ButtonStyles(theme)['Button'].style,
                        theme.typography.button,
                        {
                          backgroundColor: 'rgb(255, 255, 255)',
                          borderWidth: 5,
                          color: theme.colors.text.strong,
                          margin: 5,
                          zIndex: 1,
                        }
                      ),
                      dimensions.width
                    )}
                    title={'Accept this image?'}
                  />
                </View>
              </View>
            </View>
            <Touchable
              onPress={() => {
                try {
                  setOpenModal(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              style={StyleSheet.applyWidth(
                { height: '33.33%' },
                dimensions.width
              )}
            />
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(GenerationResultsScreen);

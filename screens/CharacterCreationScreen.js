import React from 'react';
import {
  Button,
  ExpoImage,
  IconButton,
  ScreenContainer,
  SimpleStyleKeyboardAwareScrollView,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import * as expoFileSystem from 'expo-file-system';
import * as expoSqlite from 'expo-sqlite';
import { Modal, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { Image_file_path: null };

const CharacterCreationScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [characterSheet, setCharacterSheet] = React.useState({
    characterName: null,
    characterIntro: null,
    characterDetails: null,
    characterGreeting: null,
  });
  const [openModal, setOpenModal] = React.useState(false);
  const [passedImage, setPassedImage] = React.useState(' ');
  const [selectedCharacter, setSelectedCharacter] = React.useState({});
  const asyncControl = async (
    Variables,
    setGlobalVariableValue,
    image,
    characterSheet
  ) => {
    console.log(
      'Image snippet:',
      image.substring(0, 50),
      'ImageIndex:',
      Variables.imageIndex
    );
    const fileUri = await saveImageToFileSystem(
      Variables,
      setGlobalVariableValue,
      image
    );

    if (fileUri) {
      await saveCharacterToDatabase(characterSheet, fileUri);
    } else {
      console.error(
        'Image not saved, character will not be added to the database.'
      );
    }
  };

  const saveCharacterToDatabase = async (characterSheet, imagePath) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');
    await db.withExclusiveTransactionAsync(async () => {
      let imageID = null;
      //Committing the Image file path to the database and obtaining the cooresponding ID
      if (imagePath !== null) {
        try {
          const storeImage = await db.runAsync(
            'INSERT INTO Image_file_paths (Image_file_path) VALUES ($Image_file_path)',
            { $Image_file_path: imagePath }
          );

          imageID = storeImage.lastInsertRowId;
          console.log('Insetion of the file path was successful');
        } catch (error) {
          console.errror(
            'Failed to insert image Uri into (Image_file_paths)',
            error
          );
        }
      }
      //Committing the Character to the database
      try {
        await db.runAsync(
          `INSERT INTO Characters (Name, Introduction, Initial_Greeting, In_depth_Details, Image_ID) 
    VALUES 
    ($Name, $Introduction, $Initial_Greeting, $In_depth_Details, $Image_ID)`,
          {
            $Name: characterSheet.characterName,
            $Introduction: characterSheet.characterIntro,
            $Initial_Greeting: characterSheet.characterGreeting,
            $In_depth_Details: characterSheet.characterDetails,
            $Image_ID: imageID,
          }
        );
        console.log('Insetion of the character was successful');
      } catch (error) {
        console.error('Failed to insert character into (Characters)', error);
      }
    });
    await db.closeAsync();
  };

  // Saving the chosen image to the device file system
  const saveImageToFileSystem = async (
    Variables,
    setGlobalVariableValue,
    image
  ) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/filesystem/
    //& https://www.codingeasypeasy.com/blog/expo-file-system-mastering-local-storage-and-file-management-in-your-react-native-apps
    const newimageIndex = Variables.imageIndex + 1;
    const directoryUri = expoFileSystem.documentDirectory + 'generated_Images/';
    const fileUri =
      expoFileSystem.documentDirectory +
      `generated_Images/v1_txt2img_${newimageIndex}.png`;
    let directoryExists = false;
    try {
      //Check if the directory already exists
      const directoryInfo = await expoFileSystem.getInfoAsync(directoryUri);
      if (directoryInfo.exists && directoryInfo.isDirectory) {
        directoryExists = true;
        console.log('Directory already exists:', directoryUri);
      } else {
        //Attempts to Create a new directory if it doesn't already exists
        try {
          await expoFileSystem.makeDirectoryAsync(directoryUri, {
            intermediates: true,
          });
          console.log('Directory created successfully:', directoryUri);
          directoryExists = true;
        } catch (error) {
          console.error('Error creating directory:', error);
        }
      }
    } catch (error) {
      console.error('Failed to check directory:', error);
    }
    //If the previous operations successfully found or created a generated_Images directory,
    //attempts to write the image to the file system
    if (directoryExists) {
      if (image) {
        try {
          await expoFileSystem.writeAsStringAsync(fileUri, image, {
            encoding: expoFileSystem.EncodingType.Base64,
          });
          console.log('Image path', fileUri); //Increments the app variable imageIndex
          setGlobalVariableValue({ key: 'imageIndex', value: newimageIndex });
          console.log('mageIndex:', Variables.imageIndex);
          return fileUri;
        } catch (error) {
          console.error('Failed to save image to file system:', error);
        }
      } else {
        console.log('There is no base64 image');
        return null;
      }
    } else {
      console.log('There is no directory');
      return null;
    }
  };
  const isFocused = useIsFocused();
  React.useEffect(() => {
    try {
      if (!isFocused) {
        return;
      }
      setPassedImage(params?.Image_file_path ?? defaultProps.Image_file_path);
    } catch (err) {
      console.error(err);
    }
  }, [isFocused]);

  return (
    <ScreenContainer
      hasSafeArea={true}
      scrollable={false}
      style={StyleSheet.applyWidth(
        { backgroundColor: 'rgb(252, 252, 252)', borderRadius: 15, padding: 10 },
        dimensions.width
      )}
    >
      <SimpleStyleKeyboardAwareScrollView
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps={'never'}
        viewIsInsideTabBar={false}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Image generation link */}
        <Touchable
          onPress={() => {
            try {
              navigation.navigate('StackNavigator', {
                screen: 'ImagePromptsScreen',
              });
            } catch (err) {
              console.error(err);
            }
          }}
        >
          {/* Image generation */}
          <View
            pointerEvents={'box-none'}
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                position: 'relative',
              },
              dimensions.width
            )}
          >
            {/* Character Image */}
            <ExpoImage
              allowDownscaling={true}
              cachePolicy={'disk'}
              transitionDuration={300}
              transitionEffect={'cross-dissolve'}
              {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
              contentPosition={'center'}
              resizeMode={'cover'}
              source={imageSource(`data:image/png;base64,${passedImage}`)}
              style={StyleSheet.applyWidth(
                StyleSheet.compose(
                  GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                  {
                    borderRadius: 15,
                    borderWidth: 10,
                    height: 200,
                    marginRight: 30,
                    position: 'relative',
                    width: 200,
                  }
                ),
                dimensions.width
              )}
              transitionTiming={'ease-in-out'}
            />
            <View
              style={StyleSheet.applyWidth(
                { position: 'relative' },
                dimensions.width
              )}
            >
              <Text
                accessible={true}
                selectable={false}
                {...GlobalStyles.TextStyles(theme)['Text'].props}
                numberOfLines={2}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.TextStyles(theme)['Text'].style,
                    theme.typography.body1,
                    {}
                  ),
                  dimensions.width
                )}
              >
                {'Generate \nNew Image'}
              </Text>
            </View>
          </View>
        </Touchable>
        {/* Character Name */}
        <View pointerEvents={'box-none'}>
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { fontSize: 25 }
              ),
              dimensions.width
            )}
            suppressHighlighting={true}
          >
            {'Name'}
          </Text>
          <TextInput
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                const currentValueSetVariable0 = characterSheet;
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
                updatedValueSetVariable0.characterName = newTextInputValue;
                setCharacterSheet(updatedValueSetVariable0);
              } catch (err) {
                console.error(err);
              }
            }}
            webShowOutline={true}
            {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
            autoCapitalize={'sentences'}
            clearButtonMode={'while-editing'}
            defaultValue={characterSheet?.characterName}
            keyboardAppearance={'default'}
            keyboardType={'default'}
            maxLength={25}
            multiline={false}
            numberOfLines={1}
            placeholder={"Enter your character's name"}
            scrollEnabled={false}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextInputStyles(theme)['Text Input'].style,
                theme.typography.body2,
                {
                  borderBottomWidth: 5,
                  borderColor: 'rgb(0, 0, 0)',
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 5,
                }
              ),
              dimensions.width
            )}
          />
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { alignSelf: 'flex-end' }
              ),
              dimensions.width
            )}
          >
            {'Max Characters '}
            {25}
          </Text>
        </View>
        {/* Character introduction */}
        <View>
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { fontSize: 25 }
              ),
              dimensions.width
            )}
          >
            {'Introduction'}
          </Text>
          <TextInput
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                const currentValueSetVariable0 = characterSheet;
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
                updatedValueSetVariable0.characterIntro = newTextInputValue;
                setCharacterSheet(updatedValueSetVariable0);
              } catch (err) {
                console.error(err);
              }
            }}
            webShowOutline={true}
            {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
            autoCapitalize={'sentences'}
            autoFocus={false}
            clearButtonMode={'while-editing'}
            defaultValue={characterSheet?.characterIntro}
            keyboardAppearance={'default'}
            keyboardType={'default'}
            maxLength={300}
            multiline={true}
            numberOfLines={5}
            placeholder={"Briefly describe your character's personality"}
            scrollEnabled={true}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextInputStyles(theme)['Text Input'].style,
                theme.typography.body2,
                {
                  alignSelf: 'auto',
                  borderBottomWidth: 5,
                  borderColor: 'rgb(0, 0, 0)',
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 5,
                  textAlign: 'auto',
                }
              ),
              dimensions.width
            )}
          />
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { alignSelf: 'flex-end' }
              ),
              dimensions.width
            )}
          >
            {'Max Characters '}
            {300}
          </Text>
        </View>
        {/* Initial Greeting */}
        <View>
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { fontSize: 25 }
              ),
              dimensions.width
            )}
          >
            {'Greeting'}
          </Text>
          <TextInput
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                const currentValueSetVariable0 = characterSheet;
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
                updatedValueSetVariable0.characterGreeting = newTextInputValue;
                setCharacterSheet(updatedValueSetVariable0);
              } catch (err) {
                console.error(err);
              }
            }}
            webShowOutline={true}
            {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
            autoCapitalize={'sentences'}
            autoFocus={false}
            clearButtonMode={'while-editing'}
            defaultValue={characterSheet?.characterGreeting}
            keyboardAppearance={'default'}
            keyboardType={'default'}
            maxLength={300}
            multiline={true}
            numberOfLines={5}
            placeholder={'What would your character say first?'}
            scrollEnabled={true}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextInputStyles(theme)['Text Input'].style,
                theme.typography.body2,
                {
                  alignSelf: 'auto',
                  borderBottomWidth: 5,
                  borderColor: 'rgb(0, 0, 0)',
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 5,
                  textAlign: 'auto',
                }
              ),
              dimensions.width
            )}
          />
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { alignSelf: 'flex-end' }
              ),
              dimensions.width
            )}
          >
            {'Max Characters '}
            {300}
          </Text>
        </View>
        {/* Extra character details */}
        <View>
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { fontSize: 25 }
              ),
              dimensions.width
            )}
          >
            {'In depth details'}
          </Text>
          <TextInput
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                const currentValueSetVariable0 = characterSheet;
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
                updatedValueSetVariable0.characterDetails = newTextInputValue;
                setCharacterSheet(updatedValueSetVariable0);
              } catch (err) {
                console.error(err);
              }
            }}
            webShowOutline={true}
            {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
            autoCapitalize={'sentences'}
            clearButtonMode={'while-editing'}
            defaultValue={characterSheet?.characterDetails}
            keyboardAppearance={'default'}
            keyboardType={'default'}
            maxLength={300}
            multiline={true}
            numberOfLines={6}
            placeholder={
              'Briefly describe character traits, history and or relationships'
            }
            scrollEnabled={true}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextInputStyles(theme)['Text Input'].style,
                theme.typography.body2,
                {
                  borderBottomWidth: 5,
                  borderColor: 'rgb(0, 0, 0)',
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 5,
                }
              ),
              dimensions.width
            )}
            textBreakStrategy={'simple'}
          />
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            dataDetectorType={'none'}
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { alignSelf: 'flex-end' }
              ),
              dimensions.width
            )}
          >
            {'Max Characters '}
            {300}
          </Text>
        </View>
        {/* Save the character details */}
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
                backgroundColor: null,
                borderWidth: 5,
                color: 'rgb(3, 3, 3)',
                marginTop: 10,
              }
            ),
            dimensions.width
          )}
          title={'Generate Character'}
        />
      </SimpleStyleKeyboardAwareScrollView>
      {/* Confirm Save Character */}
      <Modal
        supportedOrientations={['portrait', 'landscape']}
        animationType={'none'}
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={Boolean(openModal)}
      >
        <View
          style={StyleSheet.applyWidth(
            { flex: 1, justifyContent: 'center' },
            dimensions.width
          )}
        >
          {/* Close Character Deletion Modal  */}
          <Touchable
            onPress={() => {
              try {
                setOpenModal(false);
              } catch (err) {
                console.error(err);
              }
            }}
            activeOpacity={0.6}
            style={StyleSheet.applyWidth({ height: '30%' }, dimensions.width)}
          />
          <View
            style={StyleSheet.applyWidth(
              {
                backgroundColor: theme.colors.text.light,
                borderRadius: 8,
                borderWidth: 5,
                height: '15%',
                justifyContent: 'flex-start',
                marginLeft: 5,
                marginRight: 5,
              },
              dimensions.width
            )}
          >
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'flex-end' },
                dimensions.width
              )}
            >
              {/* Close Confirm Save Character Modal */}
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
            {/* Generate Character */}
            <Button
              accessible={true}
              iconPosition={'left'}
              onPress={() => {
                const handler = async () => {
                  console.log('Generate Character ON_PRESS Start');
                  let error = null;
                  try {
                    console.log('Start ON_PRESS:0 CUSTOM_FUNCTION');
                    await asyncControl(
                      Variables,
                      setGlobalVariableValue,
                      passedImage,
                      characterSheet
                    );
                    console.log('Complete ON_PRESS:0 CUSTOM_FUNCTION');
                    console.log('Start ON_PRESS:1 NAVIGATE');
                    navigation.navigate('HomeScreen');
                    console.log('Complete ON_PRESS:1 NAVIGATE');
                  } catch (err) {
                    console.error(err);
                    error = err.message ?? err;
                  }
                  console.log(
                    'Generate Character ON_PRESS Complete',
                    error ? { error } : 'no error'
                  );
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
                    backgroundColor: 'rgb(246, 246, 246)',
                    borderWidth: 5,
                    color: 'rgb(0, 0, 0)',
                    margin: 10,
                    textTransform: 'uppercase',
                  }
                ),
                dimensions.width
              )}
              title={`Save ${characterSheet?.characterName}?`}
            />
          </View>
          {/* Close Confirm Save Character Modal */}
          <Touchable
            onPress={() => {
              try {
                setOpenModal(false);
              } catch (err) {
                console.error(err);
              }
            }}
            activeOpacity={0.6}
            style={StyleSheet.applyWidth({ height: '55%' }, dimensions.width)}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(CharacterCreationScreen);

import React from 'react';
import {
  Button,
  ExpoImage,
  IconButton,
  ScreenContainer,
  SimpleStyleFlatList,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import * as expoFileSystem from 'expo-file-system';
import * as expoSqlite from 'expo-sqlite';
import { Modal, RefreshControl, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const HomeScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [characterList, setCharacterList] = React.useState([{}]);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedCharacter, setSelectedCharacter] = React.useState({});
  const [
    refreshingBackgroundPreviouslyCreatedCharactersList,
    setRefreshingBackgroundPreviouslyCreatedCharactersList,
  ] = React.useState(false);
  // Takes a character ID as input and deletes a character from the local SQLite database
  const deleteCharacterFromDatabase = async removedCharacter => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/filesystem/
    const fileUri = removedCharacter.Image_file_path;
    try {
      //Removing the file from local filesystem
      await expoFileSystem.deleteAsync(fileUri);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', fileUri);
    }
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');
    try {
      //Removing a character from the database
      await db.withExclusiveTransactionAsync(async () => {
        await db.runAsync(
          'DELETE FROM Characters WHERE Character_ID = $Character',
          { $Character: removedCharacter.Character_ID }
        );
      });
    } catch (error) {
      console.error(
        `Failed to remove${JSON.stringify(removedCharacter)}`,
        error
      );
    } finally {
      await db.closeAsync();
    }
  };

  const fetchCharactersFromDatabase = async () => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');

    try {
      //Retrieves the Name, Character_ID, and associated Iamge path
      await db.withExclusiveTransactionAsync(async () => {
        const characterSummaries = await db.getAllAsync(
          `SELECT Name, Character_ID, Initial_Greeting, Introduction, In_depth_Details, Image_file_path 
    FROM Characters LEFT JOIN Image_file_paths 
    ON Characters.Image_ID = Image_file_paths.Image_ID`
        );

        if (characterSummaries) {
          //Overwrites the characterList to hold the retrieved character summaries so that they can be rendered in the Flastlist
          setCharacterList(characterSummaries);
        } else {
          setCharacterList([]);
        }
      });
    } catch (error) {
      console.log('Failed to retrieve characters', error);
    } finally {
      await db.closeAsync();
    }
  };

  // //SQLite Database setup commands, run on mount of screen
  const sqliteDatabaseSetup = async () => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');
    try {
      //Create Tables
      await db.execAsync(`
      PRAGMA foreign_keys = ON;

      --This table stores all of messages sent to and received from Gemini AI
      CREATE TABLE IF NOT EXISTS Messages 
      (
          Message_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
          Sender TEXT NOT NULL, 
          Receiver TEXT NOT NULL,
          Character_ID INTEGER,
          Message TEXT,
          Timestamp TEXT,
          FOREIGN KEY (Character_ID) REFERENCES Characters(Character_ID) ON DELETE CASCADE
      );

      --This table store all Characters created through the app
      CREATE TABLE IF NOT EXISTS Characters  
      (
          Character_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
          Name TEXT,
          Introduction TEXT, 
          Initial_Greeting TEXT,
          In_depth_Details TEXT,
          Image_ID INTEGER,
          FOREIGN KEY (Image_ID) REFERENCES Image_file_paths(Image_ID) ON DELETE SET NULL
      );

      --This table stores file paths to images created in the app
      CREATE TABLE IF NOT EXISTS Image_file_paths
      (
          Image_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
          Image_file_path TEXT 
      );

      CREATE INDEX IF NOT EXISTS idx_Message_History ON Messages(Character_ID, Timestamp);`
      );
    } catch (error) {
      log.console(error);
    } finally {
      await db.closeAsync();
    }
  };
  React.useEffect(() => {
    const handler = async () => {
      console.log('Screen ON_MOUNT Start');
      let error = null;
      try {
        console.log('Start ON_MOUNT:0 CUSTOM_FUNCTION');
        await sqliteDatabaseSetup();
        console.log('Complete ON_MOUNT:0 CUSTOM_FUNCTION');
        console.log('Start ON_MOUNT:1 CUSTOM_FUNCTION');
        await fetchCharactersFromDatabase();
        console.log('Complete ON_MOUNT:1 CUSTOM_FUNCTION');
      } catch (err) {
        console.error(err);
        error = err.message ?? err;
      }
      console.log('Screen ON_MOUNT Complete', error ? { error } : 'no error');
    };
    handler();
  }, []);

  return (
    <ScreenContainer
      hasSafeArea={true}
      hasTopSafeArea={false}
      scrollable={false}
      style={StyleSheet.applyWidth(
        { backgroundColor: 'rgb(252, 252, 252)', borderRadius: 15, padding: 5 },
        dimensions.width
      )}
    >
      {/* Background */}
      <View
        pointerEvents={'box-none'}
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            alignSelf: 'stretch',
            flex: 1,
            gap: 0,
            justifyContent: 'flex-start',
          },
          dimensions.width
        )}
      >
        {/* Charater creation button title */}
        <Text
          accessible={true}
          selectable={false}
          {...GlobalStyles.TextStyles(theme)['Text'].props}
          dataDetectorType={'none'}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.TextStyles(theme)['Text'].style,
              theme.typography.body1,
              { alignSelf: 'center', flex: 0, fontSize: 36, textAlign: 'auto' }
            ),
            dimensions.width
          )}
          suppressHighlighting={true}
        >
          {'NEW CHARACTER'}{' '}
        </Text>
        {/* link to character creation page */}
        <Button
          accessible={true}
          iconPosition={'left'}
          onPress={() => {
            try {
              navigation.navigate('StackNavigator', {
                screen: 'CharacterCreationScreen',
              });
            } catch (err) {
              console.error(err);
            }
          }}
          {...GlobalStyles.ButtonStyles(theme)['Button'].props}
          activeOpacity={0.6}
          icon={'AntDesign/plus'}
          iconSize={70}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.ButtonStyles(theme)['Button'].style,
              theme.typography.button,
              {
                backgroundColor: 'rgb(235, 234, 246)',
                borderColor: 'rgb(13, 12, 13)',
                borderRadius: 30,
                borderWidth: 10,
                color: 'rgb(0, 0, 0)',
                height: 150,
                width: 300,
              }
            ),
            dimensions.width
          )}
          title={''}
        />
        {/* title for character search */}
        <Text
          accessible={true}
          selectable={false}
          {...GlobalStyles.TextStyles(theme)['Text'].props}
          dataDetectorType={'none'}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.TextStyles(theme)['Text'].style,
              theme.typography.body1,
              { alignSelf: 'center', fontSize: 32, textAlign: 'center' }
            ),
            dimensions.width
          )}
          suppressHighlighting={true}
        >
          {'EXISTING CHARACTERS'}
        </Text>
        {/* Previously created characters */}
        <View
          pointerEvents={'box-none'}
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              alignSelf: 'stretch',
              backgroundColor: 'rgb(235, 234, 246)',
              borderRadius: 50,
              borderWidth: 10,
              flex: 1,
              margin: 10,
            },
            dimensions.width
          )}
        >
          <SimpleStyleFlatList
            data={characterList}
            decelerationRate={'normal'}
            horizontal={false}
            inverted={false}
            keyExtractor={(listData, index) => listData}
            keyboardShouldPersistTaps={'never'}
            listKey={'Background->Previously created characters->List'}
            nestedScrollEnabled={false}
            numColumns={1}
            onEndReachedThreshold={0.5}
            pagingEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshingBackgroundPreviouslyCreatedCharactersList}
                onRefresh={() => {
                  const handler = async () => {
                    try {
                      setRefreshingBackgroundPreviouslyCreatedCharactersList(
                        true
                      );
                      await fetchCharactersFromDatabase();
                      console.log();
                      setRefreshingBackgroundPreviouslyCreatedCharactersList(
                        false
                      );
                    } catch (err) {
                      console.error(err);
                      setRefreshingBackgroundPreviouslyCreatedCharactersList(
                        false
                      );
                    }
                  };
                  handler();
                }}
              />
            }
            renderItem={({ item, index }) => {
              const listData = item;
              return (
                <>
                  {/* Character touchable */}
                  <Touchable
                    onLongPress={() => {
                      try {
                        setSelectedCharacter(listData);
                        setOpenModal(true);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    onPress={() => {
                      try {
                        navigation.navigate('MessagingScreen2', {
                          passedCharacter: listData,
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    activeOpacity={0.6}
                  >
                    {/* Character details wrapper */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'center',
                          backgroundColor: 'rgb(235, 234, 246)',
                          borderRadius: 50,
                          borderWidth: 10,
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          margin: 10,
                          padding: 10,
                          width: '96%',
                        },
                        dimensions.width
                      )}
                    >
                      {/* Character Image destination */}
                      <ExpoImage
                        allowDownscaling={true}
                        cachePolicy={'disk'}
                        contentPosition={'center'}
                        resizeMode={'cover'}
                        transitionDuration={300}
                        transitionEffect={'cross-dissolve'}
                        transitionTiming={'ease-in-out'}
                        {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
                        source={imageSource(`${listData?.Image_file_path}`)}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                            {
                              borderColor: 'rgb(0, 0, 0)',
                              borderRadius: 50,
                              borderWidth: 5,
                            }
                          ),
                          dimensions.width
                        )}
                      />
                      {/* Character details destination */}
                      <View
                        style={StyleSheet.applyWidth(
                          { justifyContent: 'flex-start', margin: 5 },
                          dimensions.width
                        )}
                      >
                        {/* Character name */}
                        <Text
                          accessible={true}
                          selectable={false}
                          {...GlobalStyles.TextStyles(theme)['Text'].props}
                          ellipsizeMode={'tail'}
                          numberOfLines={1}
                          style={StyleSheet.applyWidth(
                            StyleSheet.compose(
                              GlobalStyles.TextStyles(theme)['Text'].style,
                              theme.typography.body1,
                              { textTransform: 'uppercase' }
                            ),
                            dimensions.width
                          )}
                        >
                          {listData?.Name}
                        </Text>
                      </View>
                    </View>
                  </Touchable>
                </>
              );
            }}
            snapToAlignment={'start'}
            initialNumToRender={4}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={StyleSheet.applyWidth(
              { flex: 1, width: '95%' },
              dimensions.width
            )}
          />
        </View>
      </View>
      {/* Character Deletion */}
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
              {/* Close Character Deletion Modal */}
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
            {/* Delete character */}
            <Button
              accessible={true}
              iconPosition={'left'}
              onPress={() => {
                const handler = async () => {
                  console.log('Delete character ON_PRESS Start');
                  let error = null;
                  try {
                    console.log('Start ON_PRESS:0 CUSTOM_FUNCTION');
                    await deleteCharacterFromDatabase(selectedCharacter);
                    console.log('Complete ON_PRESS:0 CUSTOM_FUNCTION');
                    console.log('Start ON_PRESS:1 CUSTOM_FUNCTION');
                    await fetchCharactersFromDatabase();
                    console.log('Complete ON_PRESS:1 CUSTOM_FUNCTION');
                    console.log('Start ON_PRESS:2 CONSOLE_LOG');
                    console.log(selectedCharacter?.Name);
                    console.log('Complete ON_PRESS:2 CONSOLE_LOG');
                    console.log('Start ON_PRESS:3 SET_VARIABLE');
                    setOpenModal(false);
                    console.log('Complete ON_PRESS:3 SET_VARIABLE');
                  } catch (err) {
                    console.error(err);
                    error = err.message ?? err;
                  }
                  console.log(
                    'Delete character ON_PRESS Complete',
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
              title={`Delete ${selectedCharacter?.Name}?`}
            />
          </View>
          {/* Close Character Deletion Modal */}
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

export default withTheme(HomeScreen);

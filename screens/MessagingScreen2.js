import React from 'react';
import {
  ExpoImage,
  IconButton,
  KeyboardAvoidingView,
  LoadingIndicator,
  ScreenContainer,
  SimpleStyleFlatList,
  TextInput,
  withTheme,
} from '@draftbit/ui';
import * as googleGenai from '@google/genai';
import * as expoSqlite from 'expo-sqlite';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  passedCharacter: {
    Name: '',
    Character_ID: '',
    Introduction: '',
    Image_file_path: '',
    In_depth_Details: '',
    Initial_Greeting: '',
  },
};

const MessagingScreen2 = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [chat, setChat] = React.useState({});
  const [inputMessage, setInputMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [receiver, setReceiver] = React.useState('');
  const [sender, setSender] = React.useState('');
  // Dynamically change corner radius based on who the message is sent to ("me" vs "gemini")
  const leftCornerRadius = item => {
    return item.Receiver === 'me' ? 5 : 20;
  };

  const loadMessagesFromDatabase = async (
    characterID,
    messages,
    initialGreeting,
    characterIntro
  ) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');

    console.log('characterID', characterID);
    //Retrieves all messages associated with the input Charater ID
    await db.withExclusiveTransactionAsync(async () => {
      const messageHistory = await db.getAllAsync(
        `SELECT Sender, Message, Timestamp, Message_ID, Character_ID 
  FROM Messages 
  WHERE Messages.Character_ID = $character_ID`,
        { $character_ID: characterID }
      );
      if (messageHistory) {
        //Overwrites messages so that they can be rendered in the Flastlist
        setMessages([
          {
            Sender: 'gemini',
            Message: characterIntro,
            Receiver: 'me',
            Timestamp: '',
            Message_ID: '',
            Character_ID: '',
          },
          {
            Sender: 'gemini',
            Message: initialGreeting,
            Receiver: 'me',
            Timestamp: '',
            Message_ID: '',
            Character_ID: '',
          },
          ...messages,
          ...messageHistory,
        ]);
      }
    });
    await db.closeAsync();
  };

  // Dynamically change message alignment on the screen based on who the message is sent to ("me" vs "gemini")
  const messageAlignment = item => {
    return item.Receiver === 'me' ? 'flex-start' : 'flex-end';
  };

  // Dynamically change corner radius based on who the message is sent to ("me" vs "gemini")
  const rightCornerRadius = item => {
    return item.Receiver === 'me' ? 20 : 5;
  };

  const saveMessageToDatabase = async (
    inputMessage,
    sender,
    receiver,
    characterID,
    Messages
  ) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');

    let messageID = null;

    await db.withExclusiveTransactionAsync(async () => {
      //Committing the message to the database
      const storeMessage = await db.runAsync(
        `INSERT INTO Messages (Sender, Message, Receiver, Timestamp, Character_ID) 
  VALUES 
  ($Sender, $Message, $Receiver, datetime("now", "localtime"), $Character_ID)`,
        {
          $Sender: sender,
          $Message: inputMessage,
          $Receiver: receiver,
          $Character_ID: characterID,
        }
      );
      messageID = storeMessage.lastInsertRowId;

      const messageHistory = await db.getFirstAsync(
        `SELECT Sender, Message, Timestamp, Message_ID, Character_ID 
  FROM Messages 
  WHERE Messages.Message_ID = $message_ID`,
        { $message_ID: messageID }
      );

      setMessages([...Messages, messageHistory]);
    });
    await db.closeAsync();

    setInputMessage('');
  };
  React.useEffect(() => {
    //Ammended from https://ai.google.dev/api/caching
    //Ammended from https://ai.google.dev/gemini-api/docs/quickstart?lang=node
    //Ammended from https://aistudio.google.com/app/apps/bundled/genai_sdk_count_tokens?showCode=true&showPreview=true
    //Includes methdods from https://ai.google.dev/api/generate-content#v1beta.GenerationConfig
    const ai = new googleGenai.GoogleGenAI({
      apiKey: 'AIzaSyCmZsHkYYf3BSeQa3W6YMkT1W9CUr5imbQ',
    });
    const modelName = 'gemini-2.0-flash';
    let cacheName;

    async function cachesetup() {
      const cache = await ai.caches.create({
        model: modelName,
        config: {
          systemInstruction: newprofile,
        },
      });
      cacheName = cache.name;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      cache: cacheName,
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hi neko.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'I am a cat and my name is Neko' }],
        },
      ],
      config: {
        maxOutputTokens: 500,
        responseSchema: {},
      },
    });
  });
  React.useEffect(() => {
    const handler = async () => {
      try {
        await loadMessagesFromDatabase(
          (params?.passedCharacter ?? defaultProps.passedCharacter)
            ?.Character_ID,
          messages,
          (params?.passedCharacter ?? defaultProps.passedCharacter)
            ?.Initial_Greeting,
          (params?.passedCharacter ?? defaultProps.passedCharacter)
            ?.Introduction
        );
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
      hasTopSafeArea={false}
    >
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            height: '10%',
            margin: 10,
          },
          dimensions.width
        )}
      >
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
            `${
              (params?.passedCharacter ?? defaultProps.passedCharacter)
                ?.Image_file_path
            }`
          )}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.ExpoImageStyles(theme)['Image'].style,
              { borderColor: 'rgb(0, 0, 0)', borderRadius: 50, borderWidth: 5 }
            ),
            dimensions.width
          )}
        />
        <View
          style={StyleSheet.applyWidth(
            { alignItems: 'center', flex: 1, justifyContent: 'center' },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            ellipsizeMode={'tail'}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { flex: 1, fontSize: 32 }
              ),
              dimensions.width
            )}
          >
            {(params?.passedCharacter ?? defaultProps.passedCharacter)?.Name}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={'padding'}
        enabled={true}
        keyboardVerticalOffset={0}
        androidBehavior={'padding'}
        iosBehavior={'padding'}
        style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
      >
        <SimpleStyleFlatList
          data={messages}
          decelerationRate={'normal'}
          horizontal={false}
          inverted={false}
          keyExtractor={(listData, index) =>
            listData?.id ??
            listData?.uuid ??
            index?.toString() ??
            JSON.stringify(listData)
          }
          keyboardShouldPersistTaps={'never'}
          listKey={'Keyboard Avoiding View->List'}
          nestedScrollEnabled={false}
          numColumns={1}
          onEndReachedThreshold={0.5}
          pagingEnabled={false}
          renderItem={({ item, index }) => {
            const listData = item;
            return (
              <>
                {/* Message frame */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'flex-start',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginBottom: 5,
                      marginTop: 5,
                    },
                    dimensions.width
                  )}
                >
                  {/* Message wrapper */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignSelf: messageAlignment(listData),
                        borderBottomLeftRadius: leftCornerRadius(listData),
                        borderBottomRightRadius: rightCornerRadius(listData),
                        borderColor: 'rgb(0, 0, 0)',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderWidth: 5,
                        flexDirection: 'column',
                        margin: 10,
                        padding: 10,
                        width: '65%',
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      {...GlobalStyles.TextStyles(theme)['Text'].props}
                      selectable={true}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.TextStyles(theme)['Text'].style,
                          theme.typography.body1,
                          {
                            alignSelf: 'auto',
                            fontFamily: 'System',
                            fontSize: 20,
                            fontWeight: '700',
                            textAlign: 'auto',
                          }
                        ),
                        dimensions.width
                      )}
                    >
                      {listData?.Message}
                      {' \n'}
                      {listData?.Timestamp}
                    </Text>
                  </View>
                  <LoadingIndicator
                    color={theme.colors.branding.primary}
                    size={30}
                    type={'circleFade'}
                  />
                </View>
              </>
            );
          }}
          snapToAlignment={'start'}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={StyleSheet.applyWidth({ flex: 0.8 }, dimensions.width)}
        />
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flex: 0.1,
              flexDirection: 'row',
              justifyContent: 'center',
            },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                alignSelf: 'auto',
                backgroundColor: 'rgb(252, 252, 252)',
                borderRadius: 20,
                borderWidth: 5,
                flex: 0.8,
                flexDirection: 'row',
                justifyContent: 'center',
              },
              dimensions.width
            )}
          >
            <TextInput
              autoCorrect={true}
              changeTextDelay={500}
              onChangeText={newTextInputValue => {
                try {
                  setInputMessage(newTextInputValue);
                } catch (err) {
                  console.error(err);
                }
              }}
              {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
              autoCapitalize={'sentences'}
              blurOnSubmit={true}
              maxLength={1000}
              multiline={true}
              numberOfLines={2}
              placeholder={'Message'}
              returnKeyType={'send'}
              scrollEnabled={true}
              style={StyleSheet.applyWidth(
                StyleSheet.compose(
                  GlobalStyles.TextInputStyles(theme)['Text Input'].style,
                  theme.typography.body2,
                  {
                    borderBottomWidth: 0,
                    borderLeftWidth: 0,
                    borderRadius: 20,
                    borderRightWidth: 0,
                    borderTopWidth: 0,
                    height: '100%',
                    width: '90%',
                  }
                ),
                dimensions.width
              )}
              textBreakStrategy={'simple'}
              value={inputMessage}
              webShowOutline={false}
            />
            <IconButton
              onPress={() => {
                const handler = async () => {
                  console.log('Icon Button ON_PRESS Start');
                  let error = null;
                  try {
                    console.log('Start ON_PRESS:0 SET_VARIABLE');
                    setSender('me');
                    setReceiver('gemini');
                    setLoading(true);
                    console.log('Complete ON_PRESS:0 SET_VARIABLE');
                    console.log('Start ON_PRESS:1 CUSTOM_FUNCTION');
                    await saveMessageToDatabase(
                      inputMessage,
                      sender,
                      receiver,
                      (params?.passedCharacter ?? defaultProps.passedCharacter)
                        ?.Character_ID,
                      messages
                    );
                    console.log('Complete ON_PRESS:1 CUSTOM_FUNCTION');
                  } catch (err) {
                    console.error(err);
                    error = err.message ?? err;
                  }
                  console.log(
                    'Icon Button ON_PRESS Complete',
                    error ? { error } : 'no error'
                  );
                };
                handler();
              }}
              size={32}
              color={theme.colors.text.strong}
              disabled={Boolean(loading)}
              icon={'MaterialCommunityIcons/arrow-left-bold-outline'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default withTheme(MessagingScreen2);

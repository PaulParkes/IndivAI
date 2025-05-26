import React from 'react';
import {
  ExpoImage,
  IconButton,
  KeyboardAvoidingView,
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
import useIsFocused from '../utils/useIsFocused';
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
  const [History, setHistory] = React.useState([]);
  const [apiKey, setApiKey] = React.useState(
    'AIzaSyCmZsHkYYf3BSeQa3W6YMkT1W9CUr5imbQ'
  );
  const [inputMessage, setInputMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const generateChatHistory = messages => {
    let geminiHistory = [];
    try {
      //Rebuilding chat hitsory in the Gemini "chat" method "history" object shape
      messages.forEach(appMessage => {
        const setRole = appMessage.Sender === 'me' ? 'user' : 'model';
        geminiHistory.push({
          role: setRole,
          parts: [{ text: appMessage.Message }],
        });
      });
      console.log('Successfully created Gemini Chat History');
      return geminiHistory;
    } catch (error) {
      console.error(
        'Error whilst transforming messages to geminiHistory:',
        error
      );
    }
  };

  // Dynamically change corner radius based on who the message is sent to ("me" vs "gemini")
  const leftCornerRadius = item => {
    return item.Receiver === 'me' ? 5 : 20;
  };

  const loadMessagesFromDatabase = async (
    characterID,
    initialGreeting,
    characterIntro
  ) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');
    let messageHistory;
    try {
      //Retrieves all messages associated with the input Charater ID
      await db.withExclusiveTransactionAsync(async () => {
        messageHistory = await db.getAllAsync(
          `SELECT Sender, Message, Receiver, Timestamp, Message_ID, Character_ID 
    FROM Messages 
    WHERE Messages.Character_ID = $character_ID`,
          { $character_ID: characterID }
        );
      });
    } catch (error) {
      console.error('Error fetching Message History', error);
    } finally {
      await db.closeAsync();
    }
    if (messageHistory) {
      //Returns the messages object array
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
        ...messageHistory,
      ]);
      console.log('Successfully loaded messages from database');
    } else {
      console.log('Database missing or empty');
    }
  };

  // Dynamically change message alignment on the screen based on who the message is sent to ("me" vs "gemini")
  const messageAlignment = item => {
    return item.Receiver === 'me' ? 'flex-start' : 'flex-end';
  };

  const requestResponseFromGemini = async (
    inputMessage,
    characterID,
    messages,
    geminiApiKey,
    characterName,
    introduction,
    inDepthDetails
  ) => {
    //Ammended from https://ai.google.dev/gemini-api/docs/quickstart?lang=node
    //Includes methdods from https://ai.google.dev/api/generate-content#v1beta.GenerationConfig
    const instructions = `Your name is ${characterName}. You are ${introduction}, and you are ${inDepthDetails}. 
You always stay in character as ${characterName}. You respond from your own perspective, using "I" when referring to yourself. 
You never reveal that you are an AI or an assistant. You never break character. 
Generate a chat message in Json format 'Sender':'gemini' to 'Receiver':'me'.
Always respond with a valid JSON object in this exact format:
{
"Sender": "gemini",
"Message": "<your in-character reply>",
"Receiver": "me"
}`;
    const ai = new googleGenai.GoogleGenAI({ apiKey: geminiApiKey });
    geminihistory = generateChatHistory(messages);
    let response = {};
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: geminihistory,
        //Defining the method and size of the response from the GeminiAPI
        config: {
          responseMimeType: 'application/json', //Method
          systemInstruction: instructions, //This is where the character description is used to prompt a response in Character
          maxOutputTokens: 175, //Size
          responseSchema: {
            //JSON Shape
            type: 'object',
            properties: {
              Sender: { type: 'string' },
              Message: { type: 'string' },
              Receiver: { type: 'string' },
            },
            required: ['Sender', 'Message', 'Receiver'],
          }, //This should contribute to token count so most unnecessary spacing has been removed
        },
      });
      //console.log(response.text);
      parsedResponse = JSON.parse(response.text);
      console.log(parsedResponse);
    } catch (error) {
      console.error('Error Requesting response from Gemini:', error);
    }
    let newMessages = [];
    try {
      //Saves the user's message to the database
      newMessages.push(
        await saveMessageToDatabase(inputMessage, 'me', 'gemini', characterID)
      );
      //saves gemini's response to the database
      newMessages.push(
        await saveMessageToDatabase(
          parsedResponse.Message,
          'gemini',
          'me',
          characterID
        )
      );
      //Update the messages usestate
      setMessages(prev => [...prev, ...newMessages]);
    } catch (error) {
      console.error('Error calling saveMessageToDatabase Function:', error);
    }
  };

  // Dynamically change corner radius based on who the message is sent to ("me" vs "gemini")
  const rightCornerRadius = item => {
    return item.Receiver === 'me' ? 20 : 5;
  };

  const saveMessageToDatabase = async (
    inputMessage,
    sender,
    receiver,
    characterID
  ) => {
    //Ammended from https://docs.expo.dev/versions/v51.0.0/sdk/sqlite/
    const db = await expoSqlite.openDatabaseAsync('IndivDB');
    let messageID = null;
    let loadedMessage;
    try {
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
        //Retrieve saved message to confim it was
        loadedMessage = await db.getFirstAsync(
          `SELECT Sender, Message, Timestamp, Message_ID, Character_ID 
    FROM Messages 
    WHERE Messages.Message_ID = $message_ID`,
          { $message_ID: messageID }
        );
      });
    } catch (error) {
      console.error('Error when saving message to database:', error);
    } finally {
      await db.closeAsync();
      return loadedMessage;
    }
  };
  const isFocused = useIsFocused();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (!isFocused) {
          return;
        }
        await loadMessagesFromDatabase(
          (params?.passedCharacter ?? defaultProps.passedCharacter)
            ?.Character_ID,
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
  }, [isFocused]);

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
              maxLength={500}
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
                    setInputMessage('');
                    console.log('Complete ON_PRESS:0 SET_VARIABLE');
                    console.log('Start ON_PRESS:1 CUSTOM_FUNCTION');
                    await requestResponseFromGemini(
                      inputMessage,
                      (params?.passedCharacter ?? defaultProps.passedCharacter)
                        ?.Character_ID,
                      messages,
                      apiKey,
                      (params?.passedCharacter ?? defaultProps.passedCharacter)
                        ?.Name,
                      (params?.passedCharacter ?? defaultProps.passedCharacter)
                        ?.Introduction,
                      (params?.passedCharacter ?? defaultProps.passedCharacter)
                        ?.In_depth_Details
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

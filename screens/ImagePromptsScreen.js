import React from 'react';
import {
  Button,
  MultiSelectPicker,
  Picker,
  ScreenContainer,
  SimpleStyleKeyboardAwareScrollView,
  TextInput,
  withTheme,
} from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const ImagePromptsScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [genderOptions, setGenderOptions] = React.useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Non-Binary', value: 'Non-Binary' },
  ]);
  const [genderValue, setGenderValue] = React.useState('');
  const [imagePrompts, setImagePrompts] = React.useState('');
  const [promptExampleValue, setPromptExampleValue] = React.useState([]);
  const [promptOptions, setPromptOptions] = React.useState([
    { label: '3d-model', value: '3d-model' },
    { label: 'analog-film', value: 'analog-film' },
    { label: 'anime', value: 'anime' },
    { label: 'cinematic', value: 'cinematic' },
    { label: 'comic-book', value: 'comic-book' },
    { label: 'digital-art', value: 'digital-art' },
    { label: 'enhance', value: 'enhance' },
    { label: 'fantasy-art', value: 'fantasy-art' },
    { label: 'isometric', value: 'isometric' },
    { label: 'line-art', value: 'line-art' },
    { label: 'low-poly', value: 'low-poly' },
    { label: 'modeling-compound', value: 'modeling-compound' },
    { label: 'neon-punk', value: 'neon-punk' },
    { label: 'origami', value: 'origami' },
    { label: 'photographic', value: 'photographic' },
    { label: 'pixel-art', value: 'pixel-art' },
    { label: 'tile-texture', value: 'tile-texture' },
  ]);
  const [pickerValue, setPickerValue] = React.useState(undefined);
  // concatenates all the written and chosen prompts to send to the Generation results srceen
  const collatePrompts = (gender, examplePrompts, userPrompts) => {
    let prompts = [gender, ...examplePrompts, userPrompts];
    prompts = prompts.join(', ');
    console.log(prompts);
    return prompts;
  };

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={true}
      style={StyleSheet.applyWidth({ padding: 10 }, dimensions.width)}
    >
      <SimpleStyleKeyboardAwareScrollView
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps={'never'}
        viewIsInsideTabBar={false}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
        style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
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
              { fontSize: 36 }
            ),
            dimensions.width
          )}
          suppressHighlighting={true}
        >
          {'Generate\nCharacter'}
        </Text>
        {/* Gender selector */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignSelf: 'flex-start',
              borderRadius: 15,
              borderWidth: 5,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 10,
            },
            dimensions.width
          )}
        >
          <Picker
            autoDismissKeyboard={true}
            dropDownBackgroundColor={theme.colors.background.base}
            dropDownBorderColor={theme.colors.border.base}
            dropDownBorderRadius={8}
            dropDownBorderWidth={1}
            dropDownTextColor={theme.colors.text.strong}
            iconSize={24}
            leftIconMode={'inset'}
            onValueChange={newPickerValue => {
              try {
                setGenderValue(newPickerValue);
              } catch (err) {
                console.error(err);
              }
            }}
            selectedIconColor={theme.colors.text.strong}
            selectedIconName={'Feather/check'}
            selectedIconSize={20}
            type={'solid'}
            {...GlobalStyles.PickerStyles(theme)['Picker'].props}
            mode={'dropdown-modal'}
            options={genderOptions}
            placeholder={'Select a gender'}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.PickerStyles(theme)['Picker'].style,
                theme.typography.body2,
                {}
              ),
              dimensions.width
            )}
            value={genderValue}
          />
        </View>
        {/* Image prompts */}
        <View
          style={StyleSheet.applyWidth({ marginTop: 10 }, dimensions.width)}
        >
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
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
            {'Your Image Prompts'}
          </Text>
          <TextInput
            autoCorrect={true}
            changeTextDelay={500}
            onChangeText={newTextInputValue => {
              try {
                setImagePrompts(newTextInputValue);
              } catch (err) {
                console.error(err);
              }
            }}
            placeholder={'Enter a value...'}
            webShowOutline={true}
            {...GlobalStyles.TextInputStyles(theme)['Text Input'].props}
            autoCapitalize={'sentences'}
            keyboardAppearance={'default'}
            keyboardType={'default'}
            maxLength={300}
            multiline={true}
            numberOfLines={6}
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
                  marginTop: 5,
                }
              ),
              dimensions.width
            )}
            value={imagePrompts}
          />
          {/* Text 2 */}
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.TextStyles(theme)['Text'].style,
                theme.typography.body1,
                { alignSelf: 'flex-end' }
              ),
              dimensions.width
            )}
          >
            {'Max characters '}
            {300}
          </Text>
        </View>
        {/* Example prompts */}
        <View
          style={StyleSheet.applyWidth(
            { marginTop: 10, zIndex: 2 },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            {...GlobalStyles.TextStyles(theme)['Text'].props}
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
            {'Example prompts'}
          </Text>
          <MultiSelectPicker
            autoDismissKeyboard={true}
            dropDownBackgroundColor={theme.colors.background.base}
            dropDownBorderColor={theme.colors.border.base}
            dropDownBorderRadius={8}
            dropDownBorderWidth={1}
            dropDownTextColor={theme.colors.text.strong}
            iconSize={24}
            leftIconMode={'inset'}
            onValueChange={newMultiSelectPickerValue => {
              const pickerValue = newMultiSelectPickerValue;
              try {
                setPromptExampleValue(newMultiSelectPickerValue);
              } catch (err) {
                console.error(err);
              }
            }}
            selectedIconColor={theme.colors.text.strong}
            selectedIconName={'Feather/check'}
            selectedIconSize={20}
            type={'solid'}
            {...GlobalStyles.MultiSelectPickerStyles(theme)[
              'Multi Select Picker'
            ].props}
            options={promptOptions}
            placeholder={'Select a prompt'}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.MultiSelectPickerStyles(theme)[
                  'Multi Select Picker'
                ].style,
                theme.typography.body2,
                {
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 5,
                  marginTop: 5,
                  position: 'relative',
                }
              ),
              dimensions.width
            )}
            value={promptExampleValue}
          />
        </View>
        {/* Generate Image link */}
        <Button
          accessible={true}
          iconPosition={'left'}
          onPress={() => {
            try {
              navigation.navigate('StackNavigator', {
                screen: 'GenerationResultsScreen',
                params: {
                  imagePtompts: collatePrompts(
                    genderValue,
                    promptExampleValue,
                    imagePrompts
                  ),
                },
              });
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
                borderWidth: 5,
                color: 'rgb(0, 0, 0)',
                marginTop: 20,
                position: 'relative',
              }
            ),
            dimensions.width
          )}
          title={'Generate Image'}
        />
      </SimpleStyleKeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default withTheme(ImagePromptsScreen);

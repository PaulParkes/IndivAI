import * as React from 'react';
import { Provider as ThemeProvider } from '@draftbit/ui';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {
  ActivityIndicator,
  AppState,
  Appearance,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaFrameContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from 'react-query';
import AppNavigator from './AppNavigator';
import { GlobalVariableProvider } from './config/GlobalVariableContext';
import cacheAssetsAsync from './config/cacheAssetsAsync';
import DraftbitDefault from './themes/DraftbitDefault';
import useWindowDimensions from './utils/useWindowDimensions';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

// On web, Appearance.setColorScheme is not implemented
// See https://github.com/necolas/react-native-web/issues/2703
//
// This reimplementation is a workaround to allow the app to switch between light and dark schemes
// by storing the selection in the data-theme attribute of the document element.
if (Platform.OS === 'web') {
  Appearance.setColorScheme = scheme => {
    document.documentElement.setAttribute('data-theme', scheme);
  };

  Appearance.getColorScheme = () => {
    const systemValue = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    const userValue = document.documentElement.getAttribute('data-theme');
    return userValue && userValue !== 'null' ? userValue : systemValue;
  };

  Appearance.addChangeListener = listener => {
    // Listen for changes of system value
    const systemValueListener = e => {
      const newSystemValue = e.matches ? 'dark' : 'light';
      const userValue = document.documentElement.getAttribute('data-theme');
      listener({
        colorScheme:
          userValue && userValue !== 'null' ? userValue : newSystemValue,
      });
    };
    const systemValue = window.matchMedia('(prefers-color-scheme: dark)');
    systemValue.addEventListener('change', systemValueListener);

    // Listen for changes of user set value
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === 'data-theme') {
          listener({ colorScheme: Appearance.getColorScheme() });
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    function remove() {
      systemValue.removeEventListener('change', systemValueListener);
      observer.disconnect();
    }

    return { remove };
  };
}

const App = () => {
  const [areAssetsCached, setAreAssetsCached] = React.useState(false);
  const fontsLoaded = true;

  React.useEffect(() => {
    async function prepare() {
      try {
        await cacheAssetsAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAreAssetsCached(true);
      }
    }

    prepare();
  }, []);

  const dimensions = useWindowDimensions();
  const colorScheme = useColorScheme();

  // SafeAreaProvider sets the 'frame' once and does not update when the window size changes (on web).
  // This is particularly problematic for drawer navigators that depend on the frame size to render the drawer.
  // This overrides the value of the frame to match the current window size which addresses the issue.
  //
  // The Drawer snippet that relies on useSafeAreaFrame: https://github.com/react-navigation/react-navigation/blob/bddcc44ab0e0ad5630f7ee0feb69496412a00217/packages/drawer/src/views/DrawerView.tsx#L112
  // Issue regarding broken useSafeAreaFrame: https://github.com/th3rdwave/react-native-safe-area-context/issues/184
  const SafeAreaFrameContextProvider =
    Platform.OS === 'web' ? SafeAreaFrameContext.Provider : React.Fragment;

  const isReady = areAssetsCached && fontsLoaded;
  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      {Platform.OS === 'ios' ? (
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      ) : null}
      {Platform.OS === 'android' ? (
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      ) : null}
      <ThemeProvider
        themes={[DraftbitDefault]}
        breakpoints={{}}
        initialThemeName={'Draftbit Default'}
      >
        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          onLayout={onLayoutRootView}
        >
          <SafeAreaFrameContextProvider
            value={{
              x: 0,
              y: 0,
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            <GlobalVariableProvider>
              <QueryClientProvider client={queryClient}>
                <AppNavigator />
              </QueryClientProvider>
            </GlobalVariableProvider>
          </SafeAreaFrameContextProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </>
  );
};

export default App;

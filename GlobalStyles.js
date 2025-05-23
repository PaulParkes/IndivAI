import * as StyleSheet from './utils/StyleSheet';

import Breakpoints from './utils/Breakpoints';

import palettes from './themes/palettes';

export const PickerStyles = theme =>
  StyleSheet.create({ Picker: { style: {}, props: {} } });

export const MultiSelectPickerStyles = theme =>
  StyleSheet.create({ 'Multi Select Picker': { style: {}, props: {} } });

export const TextStyles = theme =>
  StyleSheet.create({
    Text: { style: { color: theme.colors.text.strong }, props: {} },
  });

export const ButtonStyles = theme =>
  StyleSheet.create({
    Button: {
      style: {
        backgroundColor: theme.colors.branding.primary,
        borderRadius: 8,
        fontFamily: 'System',
        fontWeight: '700',
        textAlign: 'center',
      },
      props: {},
    },
  });

export const ExpoImageStyles = theme =>
  StyleSheet.create({
    Image: { style: { height: 100, width: 100 }, props: {} },
  });

export const CircleStyles = theme =>
  StyleSheet.create({
    Circle: {
      style: {
        alignItems: 'center',
        backgroundColor: theme.colors.branding.primary,
        justifyContent: 'center',
      },
      props: {},
    },
  });

export const TextInputStyles = theme =>
  StyleSheet.create({
    'Text Input': {
      style: {
        borderBottomWidth: 1,
        borderColor: theme.colors.border.base,
        borderLeftWidth: 1,
        borderRadius: 8,
        borderRightWidth: 1,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
      },
      props: {},
    },
  });

export const NumberInputStyles = theme =>
  StyleSheet.create({
    'Number Input': {
      style: {
        borderBottomWidth: 1,
        borderColor: theme.colors.border.base,
        borderLeftWidth: 1,
        borderRadius: 8,
        borderRightWidth: 1,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
      },
      props: {},
    },
  });

export const FetchStyles = theme =>
  StyleSheet.create({ Fetch: { style: { minHeight: 40 }, props: {} } });

export const TableStyles = theme =>
  StyleSheet.create({ Table: { style: { flex: 1 }, props: {} } });

export const TableCellStyles = theme =>
  StyleSheet.create({
    'Table Cell': { style: { flex: 1, flexDirection: 'row' }, props: {} },
  });

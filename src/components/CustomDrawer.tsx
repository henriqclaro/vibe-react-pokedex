import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface CustomDrawerProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  selectedOption: string;
  onSelect: (item: string) => void;
  title: string;
  /** Optional accent colour — used for type-coloured dots in the Types drawer */
  accentColor?: string;
}

export const CustomDrawer = ({
  visible,
  onClose,
  options,
  selectedOption,
  onSelect,
  title,
  accentColor,
}: CustomDrawerProps) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSelect = (item: string) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onSelect(item);
      onClose();
    });
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Drawer panel */}
        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerDivider} />

            {/* Option list */}
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <DrawerItem
                  item={item}
                  index={index}
                  isSelected={item.toLowerCase() === selectedOption?.toLowerCase()}
                  onSelect={handleSelect}
                  capitalize={capitalize}
                  accentColor={accentColor}
                  drawerVisible={visible}
                />
              )}
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Animated drawer item ─────────────────────────────────────────────────────
interface DrawerItemProps {
  item: string;
  index: number;
  isSelected: boolean;
  onSelect: (item: string) => void;
  capitalize: (str: string) => string;
  accentColor?: string;
  drawerVisible: boolean;
}

const DrawerItem = ({
  item,
  index,
  isSelected,
  onSelect,
  capitalize,
  accentColor,
  drawerVisible,
}: DrawerItemProps) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  // Determine dot colour: accentColor means we're in the Types drawer and can
  // look up the type-specific colour; otherwise fall back to primary.
  const dotColor = accentColor
    ? (theme.colors.types as Record<string, string>)[item] ?? theme.colors.primary
    : theme.colors.primary;

  useEffect(() => {
    if (drawerVisible) {
      const delay = index * 28;
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 260, delay, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 80, delay, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(16);
    }
  }, [drawerVisible, index, fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
        style={[
          styles.item,
          isSelected && [
            styles.itemSelected,
            { borderLeftColor: dotColor },
          ],
        ]}
      >
        <View style={styles.itemRow}>
          <View style={[styles.dot, { backgroundColor: isSelected ? dotColor : 'transparent' }]} />
          <Text
            style={[
              styles.itemText,
              isSelected && { color: theme.colors.textPrimary, fontWeight: 'bold' },
            ]}
          >
            {capitalize(item)}
          </Text>
          {isSelected && (
            <Text style={[styles.checkmark, { color: dotColor }]}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: theme.colors.overlay,
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: theme.colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  headerDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  listContent: {
    paddingVertical: theme.spacing.sm,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    marginVertical: 2,
    borderRadius: theme.roundness.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  itemSelected: {
    backgroundColor: theme.colors.glass,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textSecondary,
    letterSpacing: 0.2,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

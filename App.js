import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categories = [
    { name: 'Food', icon: 'restaurant', color: ['#FF6B6B', '#FF8E53'] },
    { name: 'Transport', icon: 'car', color: ['#4ECDC4', '#44A08D'] },
    { name: 'Shopping', icon: 'bag', color: ['#A8EDEA', '#FED6E3'] },
    { name: 'Bills', icon: 'home', color: ['#FFECD2', '#FCB69F'] },
    { name: 'Health', icon: 'heart', color: ['#FF9A9E', '#FECFEF'] },
    { name: 'Other', icon: 'ellipsis-horizontal', color: ['#667eea', '#764ba2'] }
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (expenses.length > 0 && !isLoading) {
      saveExpenses();
    }
  }, [expenses, isLoading]);

  const initializeApp = async () => {
    try {
      await loadExpenses();
      setIsLoading(false);
      setTimeout(() => {
        startEntranceAnimations();
      }, 100);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async () => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const startEntranceAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    if (!isLoading) {
      startEntranceAnimations();
    }
  }, [currentScreen]);

  const addExpense = () => {
    if (newExpense.amount && newExpense.category) {
      const expense = {
        id: Date.now(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
      };
      
      setExpenses([expense, ...expenses]);
      setNewExpense({ 
        amount: '', 
        category: 'Food', 
        date: new Date().toISOString().split('T')[0] 
      });
      
      Alert.alert('Success!', 'Expense added successfully', [
        { text: 'OK', onPress: () => setCurrentScreen('home') }
      ]);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const clearAllExpenses = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all expenses? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('expenses');
              setExpenses([]);
              Alert.alert('Success', 'All expenses have been deleted');
            } catch (error) {
              console.error('Error clearing expenses:', error);
              Alert.alert('Error', 'Failed to clear expenses');
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'There are no expenses to export');
      return;
    }

    const exportString = JSON.stringify(expenses, null, 2);
    console.log('Exported data:', exportString);
    
    Alert.alert(
      'Export Data', 
      `Your expense data has been logged to console. Total records: ${expenses.length}`,
      [{ text: 'OK' }]
    );
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : 'ellipsis-horizontal';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : ['#667eea', '#764ba2'];
  };

  const FloatingButton = ({ onPress }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [{ scale: buttonScale }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const LoadingScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.background}>
        <View style={styles.loadingContainer}>
          <Ionicons name="wallet" size={48} color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  const HomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.background}>
        <View style={[styles.backgroundCircle1]} />
        <View style={[styles.backgroundCircle2]} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: isLoading ? 1 : fadeAnim,
                transform: [{ translateY: isLoading ? 0 : slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Expense Tracker</Text>
                <Text style={styles.headerSubtitle}>Manage your spending wisely</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.headerIcon}
                  onPress={() => setCurrentScreen('settings')}
                >
                  <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Balance Card */}
            <Animated.View
              style={[
                styles.balanceCard,
                { transform: [{ scale: isLoading ? 1 : scaleAnim }] }
              ]}
            >
              <View style={styles.balanceCardContent}>
                <View style={styles.balanceHeader}>
                  <View style={styles.balanceIconContainer}>
                    <Ionicons name="trending-up" size={20} color="white" />
                  </View>
                  <Text style={styles.balanceLabel}>Total Expenses</Text>
                </View>
                <Text style={styles.balanceAmount}>₹{totalExpenses.toFixed(2)}</Text>
                <Text style={styles.balanceChange}>
                  {expenses.length === 0 ? 'Start tracking expenses' : `${expenses.length} transactions`}
                </Text>
              </View>
            </Animated.View>

            {/* Recent Expenses */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Expenses</Text>
                {expenses.length > 0 && (
                  <TouchableOpacity onPress={() => setCurrentScreen('expenses')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.5)" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No expenses yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Tap the + button to add your first expense
                  </Text>
                </View>
              ) : (
                expenses.slice(0, 3).map((expense, index) => (
                  <Animated.View
                    key={expense.id}
                    style={[
                      styles.expenseItem,
                      {
                        opacity: isLoading ? 1 : fadeAnim,
                        transform: [{ translateY: isLoading ? 0 : slideAnim }]
                      }
                    ]}
                  >
                    <View style={styles.expenseItemContent}>
                      <View style={styles.expenseLeft}>
                        <LinearGradient
                          colors={getCategoryColor(expense.category)}
                          style={styles.expenseIcon}
                        >
                          <Ionicons
                            name={getCategoryIcon(expense.category)}
                            size={20}
                            color="white"
                          />
                        </LinearGradient>
                        <View style={styles.expenseDetails}>
                          <Text style={styles.expenseCategory}>{expense.category}</Text>
                          <Text style={styles.expenseDate}>{expense.date}</Text>
                        </View>
                      </View>
                      <Text style={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</Text>
                    </View>
                  </Animated.View>
                ))
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <FloatingButton onPress={() => setCurrentScreen('add')} />
      </LinearGradient>
    </SafeAreaView>
  );

  const AddExpenseScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.background}>
        <View style={[styles.backgroundCircle1]} />
        <View style={[styles.backgroundCircle2]} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.screenHeader}>
              <TouchableOpacity
                onPress={() => setCurrentScreen('home')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Add Expense</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="cash" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={newExpense.amount}
                    onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      onPress={() => setNewExpense({...newExpense, category: category.name})}
                      style={[
                        styles.categoryButton,
                        newExpense.category === category.name && styles.categoryButtonSelected
                      ]}
                    >
                      <LinearGradient
                        colors={category.color}
                        style={styles.categoryIconContainer}
                      >
                        <Ionicons name={category.icon} size={16} color="white" />
                      </LinearGradient>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={newExpense.date}
                    onChangeText={(text) => setNewExpense({...newExpense, date: text})}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={addExpense}
                disabled={!newExpense.amount}
                style={[
                  styles.addButton,
                  !newExpense.amount && styles.addButtonDisabled
                ]}
              >
                <LinearGradient
                  colors={newExpense.amount ? ['#667eea', '#764ba2'] : ['#888', '#666']}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );

  const ExpensesScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.background}>
        <View style={[styles.backgroundCircle1]} />
        <View style={[styles.backgroundCircle2]} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.screenHeader}>
              <TouchableOpacity
                onPress={() => setCurrentScreen('home')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>All Expenses</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.totalSummary}>
              <Text style={styles.totalLabel}>Total Spending</Text>
              <Text style={styles.totalAmount}>₹{totalExpenses.toFixed(2)}</Text>
              <Text style={styles.totalTransactions}>{expenses.length} transactions</Text>
            </View>

            <View style={styles.allExpensesContainer}>
              {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="receipt-outline" size={64} color="rgba(255,255,255,0.5)" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No expenses recorded</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Start tracking your expenses by adding your first one
                  </Text>
                </View>
              ) : (
                expenses.map((expense, index) => (
                  <Animated.View
                    key={expense.id}
                    style={[
                      styles.expenseItem,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    <View style={styles.expenseItemContent}>
                      <View style={styles.expenseLeft}>
                        <LinearGradient
                          colors={getCategoryColor(expense.category)}
                          style={styles.expenseIcon}
                        >
                          <Ionicons
                            name={getCategoryIcon(expense.category)}
                            size={20}
                            color="white"
                          />
                        </LinearGradient>
                        <View style={styles.expenseDetails}>
                          <Text style={styles.expenseCategory}>{expense.category}</Text>
                          <Text style={styles.expenseDate}>{expense.date}</Text>
                        </View>
                      </View>
                      <Text style={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</Text>
                    </View>
                  </Animated.View>
                ))
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <FloatingButton onPress={() => setCurrentScreen('add')} />
      </LinearGradient>
    </SafeAreaView>
  );

  const SettingsScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ff9a9e', '#fecfef']} style={styles.background}>
        <View style={[styles.backgroundCircle1]} />
        <View style={[styles.backgroundCircle2]} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.screenHeader}>
              <TouchableOpacity
                onPress={() => setCurrentScreen('home')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Settings</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.settingsContainer}>
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                
                <TouchableOpacity 
                  style={styles.settingsItem}
                  onPress={clearAllExpenses}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIcon, { backgroundColor: '#ff4757' }]}>
                      <Ionicons name="trash" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.settingsItemTitle}>Clear All Data</Text>
                      <Text style={styles.settingsItemSubtitle}>Delete all expense records</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingsItem}
                  onPress={exportData}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIcon, { backgroundColor: '#5352ed' }]}>
                      <Ionicons name="download" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.settingsItemTitle}>Export Data</Text>
                      <Text style={styles.settingsItemSubtitle}>Save expenses to file</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>About</Text>
                
                <View style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIcon, { backgroundColor: '#2ed573' }]}>
                      <Ionicons name="information" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.settingsItemTitle}>App Version</Text>
                      <Text style={styles.settingsItemSubtitle}>1.0.0</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIcon, { backgroundColor: '#ffa502' }]}>
                      <Ionicons name="analytics" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.settingsItemTitle}>Total Expenses</Text>
                      <Text style={styles.settingsItemSubtitle}>{expenses.length} records</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  const screens = {
    home: <HomeScreen />,
    add: <AddExpenseScreen />,
    expenses: <ExpensesScreen />,
    settings: <SettingsScreen />
  };

  return (
    <View style={styles.app}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {screens[currentScreen]}
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -50,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 30,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceCard: {
    marginBottom: 30,
  },
  balanceCardContent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 25,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  balanceChange: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  recentSection: {
    marginBottom: 100,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  viewAllText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  expenseItem: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  expenseItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 3,
  },
  expenseDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 30,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: (width - 60) / 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  totalSummary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  totalTransactions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  allExpensesContainer: {
    marginBottom: 100,
  },
   headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsContainer: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default App;
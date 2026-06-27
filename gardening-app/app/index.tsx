import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@gardening/shared';
import { loadNativeStaySignedInPreference } from '@/lib/supabase';

export default function LoginScreen() {
  const { user, loading, signIn, signUp, error, clearError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadNativeStaySignedInPreference().then(setStaySignedIn);
  }, []);
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/map');
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      if (isSignUp) {
        const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, {
          staySignedIn,
        });
        if (!signUpError) {
          if (needsEmailConfirmation) {
            Alert.alert('Account created', 'Check your email to confirm, then sign in.');
            setIsSignUp(false);
          } else {
            router.replace('/(tabs)/map');
          }
        }
      } else {
        const { error: signInError } = await signIn(email, password, { staySignedIn });
        if (!signInError) {
          router.replace('/(tabs)/map');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Garden Map</Text>
        <Text style={styles.subtitle}>Sign in to map your plants</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isSignUp ? (
          <View style={styles.staySignedInRow}>
            <Switch
              value={staySignedIn}
              onValueChange={setStaySignedIn}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={staySignedIn ? '#059669' : '#f9fafb'}
            />
            <Text style={styles.staySignedInLabel}>Stay signed in</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            clearError();
            setIsSignUp(!isSignUp);
          }}
        >
          <Text style={styles.link}>
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#064e3b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  staySignedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  staySignedInLabel: {
    fontSize: 14,
    color: '#374151',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#047857',
    fontSize: 14,
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
    fontSize: 14,
  },
});

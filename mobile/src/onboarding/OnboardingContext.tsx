import AsyncStorage from'@react-native-async-storage/async-storage';
import{createContext,useContext,useEffect,useMemo,useState,type PropsWithChildren}from'react';
const KEY='career_guidance_ai_onboarding_complete';
interface OnboardingValue{complete:boolean;ready:boolean;finish():Promise<void>}
const Context=createContext<OnboardingValue|null>(null);
export function OnboardingProvider({children}:PropsWithChildren){const[complete,setComplete]=useState(false),[ready,setReady]=useState(false);useEffect(()=>{void AsyncStorage.getItem(KEY).then(value=>setComplete(value==='true')).catch(()=>setComplete(false)).finally(()=>setReady(true))},[]);const value=useMemo<OnboardingValue>(()=>({complete,ready,finish:async()=>{setComplete(true);try{await AsyncStorage.setItem(KEY,'true')}catch{return}}}),[complete,ready]);return <Context.Provider value={value}>{children}</Context.Provider>}
export function useOnboarding(){const value=useContext(Context);if(!value)throw new Error('OnboardingProvider is missing');return value}

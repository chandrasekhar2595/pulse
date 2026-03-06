import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Animated, TextInput,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
  Dimensions, PanResponder
} from 'react-native';

const C = {
  bg:'#080A10', card:'#12151F', border:'#1E2235', gold:'#B8935A',
  green:'#7EC8A0', orange:'#C8A97E', red:'#E87E7E', text:'#E8E4DC',
  sub:'#8888AA', dim:'#4A4A6A', teal:'#2E7D8C',
};

// ─── ONBOARDING (swipe + back) ────────────────────────────────────────────────
function OnboardingScreen({ onDone }: { onDone: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const fade = useRef(new Animated.Value(1)).current;
  const steps = [
    { emoji:'🫀', title:'Pulse', body:"The ambient loneliness detector.\nBuilt to notice when you're drifting — before you do." },
    { emoji:'📡', title:'Passive by design', body:"No journaling. No check-ins.\nPulse watches quietly and only speaks up when it matters." },
    { emoji:'🔒', title:'Private by default', body:"Every signal is processed on your device.\nNothing personal ever leaves your phone." },
    { emoji:'👋', title:"What should Pulse call you?", body:null },
  ];

  function goTo(n: number) {
    if (n < 0 || n > 3) return;
    Animated.timing(fade,{toValue:0,duration:150,useNativeDriver:true}).start(()=>{
      setStep(n);
      Animated.timing(fade,{toValue:1,duration:250,useNativeDriver:true}).start();
    });
  }

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_,g) => Math.abs(g.dx) > 20 && Math.abs(g.dy) < 40,
    onPanResponderRelease: (_,g) => {
      if (g.dx < -50) goTo(step + 1);
      if (g.dx > 50) goTo(step - 1);
    }
  })).current;

  const s = steps[step];
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <StatusBar barStyle="light-content"/>
      <Animated.View {...pan.panHandlers} style={{flex:1,opacity:fade,alignItems:'center',justifyContent:'center',paddingHorizontal:32}}>
        <Text style={{fontSize:72,marginBottom:24}}>{s.emoji}</Text>
        <Text style={{fontSize:28,fontWeight:'700',color:C.text,textAlign:'center',marginBottom:16}}>{s.title}</Text>
        {s.body && <Text style={{fontSize:17,color:C.sub,textAlign:'center',lineHeight:26}}>{s.body}</Text>}
        {step===3 && (
          <TextInput style={{marginTop:24,width:'100%',backgroundColor:C.card,borderRadius:12,padding:16,fontSize:18,color:C.text,borderWidth:1,borderColor:C.gold}}
            placeholder="Your first name" placeholderTextColor={C.dim} value={name} onChangeText={setName} autoFocus/>
        )}
        {step > 0 && step < 3 && <Text style={{marginTop:28,fontSize:13,color:C.dim}}>swipe to go back or forward</Text>}
      </Animated.View>
      <View style={{paddingHorizontal:32,paddingBottom:48}}>
        <View style={{flexDirection:'row',justifyContent:'center',marginBottom:20}}>
          {steps.map((_,i)=><View key={i} style={{width:i===step?24:8,height:8,borderRadius:4,backgroundColor:i===step?C.gold:C.dim,marginHorizontal:4}}/>)}
        </View>
        <TouchableOpacity onPress={()=>step===3?onDone(name.trim()||'Friend'):goTo(step+1)}
          style={{backgroundColor:C.gold,borderRadius:14,paddingVertical:16,alignItems:'center'}}>
          <Text style={{color:'#000',fontSize:17,fontWeight:'700'}}>{step===3?'Get Started':'Continue'}</Text>
        </TouchableOpacity>
        {step > 0 && (
          <TouchableOpacity onPress={()=>goTo(step-1)} style={{marginTop:14,alignItems:'center'}}>
            <Text style={{color:C.sub,fontSize:15}}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ name, onTab }: { name:string; onTab:(t:string)=>void }) {
  const score = 0.32;
  const barAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(()=>{Animated.timing(barAnim,{toValue:score,duration:1400,useNativeDriver:false}).start();},[]);
  const color = score<0.4?C.green:score<0.65?C.orange:C.red;
  const label = score<0.4?'Connected':score<0.65?'Drifting':'Isolated';
  const barW = barAnim.interpolate({inputRange:[0,1],outputRange:['0%','100%']});
  const greet = ['Hey','Hi','Hello','Good to see you'][new Date().getHours()%4];
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <View>
            <Text style={{fontSize:24,fontWeight:'700',color:C.text}}>{greet}, {name}</Text>
            <Text style={{fontSize:14,color:C.sub,marginTop:2}}>{dateStr}</Text>
          </View>
          <View style={{width:12,height:12,borderRadius:6,backgroundColor:C.green}}/>
        </View>
        <View style={{backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:14,borderWidth:1,borderColor:C.border}}>
          <Text style={{fontSize:11,color:C.dim,fontWeight:'700',letterSpacing:1,marginBottom:10}}>CONNECTION SIGNAL</Text>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
            <Text style={{fontSize:28,fontWeight:'800',color}}>{label}</Text>
            <Text style={{fontSize:22,fontWeight:'700',color}}>{Math.round(score*100)}%</Text>
          </View>
          <View style={{height:8,backgroundColor:C.border,borderRadius:4,overflow:'hidden',marginBottom:8}}>
            <Animated.View style={{height:'100%',width:barW,backgroundColor:color,borderRadius:4}}/>
          </View>
          <Text style={{fontSize:12,color:C.dim}}>Based on your patterns · All processing on-device 🔒</Text>
        </View>
        <TouchableOpacity style={{backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:14,borderWidth:1,borderColor:C.gold,flexDirection:'row',alignItems:'center'}} onPress={()=>onTab('Nudges')}>
          <Text style={{fontSize:28,marginRight:12}}>💬</Text>
          <View style={{flex:1}}>
            <Text style={{fontSize:12,color:C.gold,fontWeight:'600',marginBottom:4}}>TODAY'S NUDGE</Text>
            <Text style={{fontSize:15,color:C.text,lineHeight:22}}>You've been pretty connected this week. Keep it up 🌱</Text>
          </View>
        </TouchableOpacity>
        <Text style={{fontSize:16,fontWeight:'700',color:C.text,marginBottom:12}}>Quick Actions</Text>
        <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
          {[{emoji:'🤝',label:'Events',tab:'Events'},{emoji:'💬',label:'Chat',tab:'Chat'},{emoji:'📊',label:'Insights',tab:'Insights'}].map(a=>(
            <TouchableOpacity key={a.tab} onPress={()=>onTab(a.tab)} style={{flex:1,backgroundColor:C.card,borderRadius:14,padding:16,alignItems:'center',borderWidth:1,borderColor:C.border}}>
              <Text style={{fontSize:26,marginBottom:6}}>{a.emoji}</Text>
              <Text style={{fontSize:13,color:C.sub}}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{fontSize:16,fontWeight:'700',color:C.text,marginBottom:12}}>Recent Activity</Text>
        {[{text:"Pulse noticed you've been active socially",time:'2h ago',dot:C.green},{text:'You responded to 3 nudges this week',time:'1d ago',dot:C.gold},{text:'Connection score improved +12%',time:'3d ago',dot:C.green}].map((item,i)=>(
          <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:14}}>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:item.dot,marginRight:12}}/>
            <Text style={{flex:1,fontSize:14,color:C.sub}}>{item.text}</Text>
            <Text style={{fontSize:12,color:C.dim}}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── CHAT (fixed keyboard + send button) ─────────────────────────────────────
function ChatScreen() {
  const [messages, setMessages] = useState([{id:1,role:'ai',text:"Hey 👋 I'm Pulse. I've been quietly watching your patterns. How are you feeling today?"}]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const replies = [
    "I hear you. Is there someone specific you've been thinking about reaching out to?",
    "Your connection score has been stable this week — that's actually a good sign.",
    "Have you thought about texting someone you haven't spoken to in a while?",
    "You don't have to have something important to say. Sometimes 'thinking of you' is enough.",
    "What's one small connection you could make today? Doesn't have to be big.",
  ];
  function send() {
    if (!input.trim()) return;
    setMessages(m=>[...m,{id:Date.now(),role:'user',text:input.trim()}]);
    setInput(''); setTyping(true);
    setTimeout(()=>{
      setMessages(m=>[...m,{id:Date.now()+1,role:'ai',text:replies[Math.floor(Math.random()*replies.length)]}]);
      setTyping(false);
    },1200);
  }
  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      <SafeAreaView style={{backgroundColor:C.bg}}>
        <View style={{padding:20,paddingBottom:14,borderBottomWidth:1,borderColor:C.border}}>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text}}>🫀 Pulse AI</Text>
          <Text style={{fontSize:13,color:C.green,marginTop:2}}>● Online · Here for you</Text>
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
        <ScrollView ref={scrollRef} style={{flex:1,padding:16}}
          contentContainerStyle={{paddingBottom:8}}
          onContentSizeChange={()=>scrollRef.current?.scrollToEnd({animated:true})}
          keyboardDismissMode="interactive">
          {messages.map(m=>(
            <View key={m.id} style={{flexDirection:'row',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:12}}>
              <View style={{maxWidth:'80%',padding:14,borderRadius:18,backgroundColor:m.role==='user'?C.gold:C.card,
                borderBottomRightRadius:m.role==='user'?4:18,borderBottomLeftRadius:m.role==='ai'?4:18}}>
                <Text style={{fontSize:15,color:m.role==='user'?'#000':C.text,lineHeight:22}}>{m.text}</Text>
              </View>
            </View>
          ))}
          {typing&&(
            <View style={{flexDirection:'row',marginBottom:12}}>
              <View style={{backgroundColor:C.card,padding:14,borderRadius:18,borderBottomLeftRadius:4}}>
                <Text style={{color:C.sub,fontSize:18}}>···</Text>
              </View>
            </View>
          )}
        </ScrollView>
        {/* INPUT BAR - stays above keyboard */}
        <View style={{flexDirection:'row',alignItems:'flex-end',paddingHorizontal:12,paddingVertical:10,
          borderTopWidth:1,borderColor:C.border,backgroundColor:C.bg}}>
          <TextInput
            style={{flex:1,backgroundColor:C.card,borderRadius:22,paddingHorizontal:16,paddingTop:10,
              paddingBottom:10,fontSize:15,color:C.text,marginRight:8,maxHeight:120,
              borderWidth:1,borderColor:C.border}}
            placeholder="Talk to Pulse..." placeholderTextColor={C.dim}
            value={input} onChangeText={setInput} multiline
          />
          <TouchableOpacity onPress={send}
            style={{width:46,height:46,borderRadius:23,backgroundColor:input.trim()?C.gold:C.dim,
              alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:22,color:'#000'}}>↑</Text>
          </TouchableOpacity>
        </View>
        <SafeAreaView style={{backgroundColor:C.bg}}/>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── NUDGES ───────────────────────────────────────────────────────────────────
function NudgesScreen() {
  const [done, setDone] = useState<number[]>([]);
  const nudges = [
    {id:1,type:'Reach out',emoji:'💬',text:"Text Marcus — you haven't spoken in 3 weeks. He posted a story yesterday."},
    {id:2,type:'Tiny action',emoji:'❤️',text:'Like or comment on something a friend posted. Takes 10 seconds.'},
    {id:3,type:'Real world',emoji:'☕',text:'Suggest coffee with a colleague this week. A simple "free this week?" is enough.'},
    {id:4,type:'Micro-event',emoji:'🚶',text:"There's a casual sunset walk group nearby at 6pm. Low pressure, outdoors."},
    {id:5,type:'Check in',emoji:'📞',text:'Call someone in your family. Even a 5-minute check-in counts.'},
  ];
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <View style={{padding:20,paddingBottom:0}}>
        <Text style={{fontSize:24,fontWeight:'700',color:C.text}}>Today's Nudges</Text>
        <Text style={{fontSize:14,color:C.sub,marginTop:4}}>{done.length}/{nudges.length} completed</Text>
        <View style={{height:4,backgroundColor:C.border,borderRadius:2,marginTop:12,overflow:'hidden'}}>
          <View style={{height:'100%',width:`${(done.length/nudges.length)*100}%`,backgroundColor:C.gold,borderRadius:2}}/>
        </View>
      </View>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
        {nudges.map(n=>(
          <View key={n.id} style={{backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:14,
            borderWidth:1,borderColor:C.border,opacity:done.includes(n.id)?0.5:1}}>
            <View style={{flexDirection:'row',alignItems:'flex-start'}}>
              <Text style={{fontSize:28,marginRight:12}}>{n.emoji}</Text>
              <View style={{flex:1}}>
                <Text style={{fontSize:11,color:C.gold,fontWeight:'700',marginBottom:4}}>{n.type.toUpperCase()}</Text>
                <Text style={{fontSize:15,color:C.text,lineHeight:22,marginBottom:12}}>{n.text}</Text>
                <TouchableOpacity onPress={()=>setDone(d=>d.includes(n.id)?d.filter(x=>x!==n.id):[...d,n.id])}
                  style={{backgroundColor:done.includes(n.id)?C.dim:C.gold,borderRadius:10,paddingVertical:10,alignItems:'center'}}>
                  <Text style={{color:done.includes(n.id)?C.text:'#000',fontWeight:'600',fontSize:14}}>
                    {done.includes(n.id)?'✓ Done':'Mark as done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function EventsScreen() {
  const [filter, setFilter] = useState('All');
  const filters = ['All','Quiet','Social','Active','Creative'];
  const events = [
    {id:1,title:'Sunset Walk Group',vibe:'Active',emoji:'🌅',time:'Today 6:00 PM',dist:'0.8 mi',people:8,desc:'A casual 30-min walk. No fitness level required. Just show up.'},
    {id:2,title:'Silent Reading Hour',vibe:'Quiet',emoji:'📚',time:'Today 7:30 PM',dist:'1.2 mi',people:12,desc:'Cozy coffee shop. Everyone reads their own book. Surprisingly not lonely.'},
    {id:3,title:'Board Games Night',vibe:'Social',emoji:'🎲',time:'Tomorrow 7:00 PM',dist:'2.1 mi',people:16,desc:'Casual games, no experience needed. Come alone, leave with people.'},
    {id:4,title:'Sketchbook Meetup',vibe:'Creative',emoji:'🎨',time:'Tomorrow 3:00 PM',dist:'1.8 mi',people:6,desc:"Bring whatever you're working on. All skill levels. Good vibes."},
    {id:5,title:'Morning Coffee Run',vibe:'Active',emoji:'☕',time:'Sat 8:00 AM',dist:'0.5 mi',people:10,desc:'Easy 2-mile jog followed by coffee. Pace is conversational — seriously.'},
  ];
  const filtered = filter==='All'?events:events.filter(e=>e.vibe===filter);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <View style={{padding:20,paddingBottom:0}}>
        <Text style={{fontSize:24,fontWeight:'700',color:C.text}}>Nearby Events</Text>
        <Text style={{fontSize:14,color:C.sub,marginTop:4}}>Low-pressure. No commitment required.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:14,marginBottom:4}}>
          {filters.map(f=>(
            <TouchableOpacity key={f} onPress={()=>setFilter(f)}
              style={{paddingHorizontal:16,paddingVertical:8,borderRadius:20,marginRight:8,
                backgroundColor:f===filter?C.gold:C.card,borderWidth:1,borderColor:f===filter?C.gold:C.border}}>
              <Text style={{color:f===filter?'#000':C.sub,fontWeight:'600',fontSize:13}}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
        {filtered.map(e=>(
          <View key={e.id} style={{backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:14,borderWidth:1,borderColor:C.border}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
              <Text style={{fontSize:28}}>{e.emoji}</Text>
              <View style={{backgroundColor:C.border,borderRadius:8,paddingHorizontal:10,paddingVertical:4}}>
                <Text style={{fontSize:11,color:C.gold,fontWeight:'700'}}>{e.vibe.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={{fontSize:17,fontWeight:'700',color:C.text,marginBottom:4}}>{e.title}</Text>
            <Text style={{fontSize:14,color:C.sub,lineHeight:20,marginBottom:12}}>{e.desc}</Text>
            <View style={{flexDirection:'row',gap:16,marginBottom:14}}>
              <Text style={{fontSize:13,color:C.dim}}>🕐 {e.time}</Text>
              <Text style={{fontSize:13,color:C.dim}}>📍 {e.dist}</Text>
              <Text style={{fontSize:13,color:C.dim}}>👥 {e.people} going</Text>
            </View>
            <TouchableOpacity style={{backgroundColor:C.teal,borderRadius:10,paddingVertical:10,alignItems:'center'}}>
              <Text style={{color:C.text,fontWeight:'600',fontSize:14}}>I'm interested</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
function InsightsScreen() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const scores = [0.45,0.52,0.38,0.61,0.32,0.28,0.35];
  const maxScore = Math.max(...scores);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
        <Text style={{fontSize:24,fontWeight:'700',color:C.text,marginBottom:4}}>Your Insights</Text>
        <Text style={{fontSize:14,color:C.sub,marginBottom:24}}>7-day connection pattern</Text>
        <View style={{backgroundColor:C.card,borderRadius:16,padding:18,marginBottom:14,borderWidth:1,borderColor:C.border}}>
          <Text style={{fontSize:11,color:C.dim,fontWeight:'700',letterSpacing:1,marginBottom:16}}>CONNECTION SCORE — LAST 7 DAYS</Text>
          <View style={{flexDirection:'row',alignItems:'flex-end',height:120,gap:8}}>
            {scores.map((s,i)=>{
              const col=s<0.4?C.green:s<0.65?C.orange:C.red;
              return (
                <View key={i} style={{flex:1,alignItems:'center'}}>
                  <Text style={{fontSize:10,color:C.dim,marginBottom:4}}>{Math.round(s*100)}</Text>
                  <View style={{width:'100%',height:(s/maxScore)*90,backgroundColor:col,borderRadius:6,opacity:i===4?1:0.6}}/>
                  <Text style={{fontSize:11,color:i===4?C.gold:C.dim,marginTop:4,fontWeight:i===4?'700':'400'}}>{days[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={{flexDirection:'row',gap:10,marginBottom:14}}>
          {[{label:'Avg Score',value:'41%',color:C.orange},{label:'Best Day',value:'Sat',color:C.green},{label:'Nudges Taken',value:'7',color:C.gold},{label:'Week Trend',value:'↑12%',color:C.green}].map((stat,i)=>(
            <View key={i} style={{flex:1,backgroundColor:C.card,borderRadius:14,padding:14,alignItems:'center',borderWidth:1,borderColor:C.border}}>
              <Text style={{fontSize:18,fontWeight:'800',color:stat.color}}>{stat.value}</Text>
              <Text style={{fontSize:10,color:C.dim,marginTop:4,textAlign:'center'}}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={{backgroundColor:C.card,borderRadius:16,padding:18,borderWidth:1,borderColor:C.border}}>
          <Text style={{fontSize:11,color:C.dim,fontWeight:'700',letterSpacing:1,marginBottom:4}}>SIGNAL BREAKDOWN</Text>
          {[{label:'Message frequency',value:72,color:C.green},{label:'Social media (active)',value:45,color:C.orange},{label:'Screen time pattern',value:60,color:C.green},{label:'Voice call recency',value:30,color:C.red},{label:'Late-night activity',value:55,color:C.orange}].map((sig,i)=>(
            <View key={i} style={{marginTop:14}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                <Text style={{fontSize:13,color:C.sub}}>{sig.label}</Text>
                <Text style={{fontSize:13,color:sig.color,fontWeight:'600'}}>{sig.value}%</Text>
              </View>
              <View style={{height:6,backgroundColor:C.border,borderRadius:3,overflow:'hidden'}}>
                <View style={{height:'100%',width:`${sig.value}%`,backgroundColor:sig.color,borderRadius:3}}/>
              </View>
            </View>
          ))}
        </View>
        <View style={{padding:16,backgroundColor:C.card,borderRadius:14,marginTop:14,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:C.border}}>
          <Text style={{fontSize:20,marginRight:10}}>🔒</Text>
          <Text style={{flex:1,fontSize:13,color:C.dim,lineHeight:20}}>All signal processing happens on your device. Zero personal data is ever transmitted.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (name: string, email: string) => void }) {
  const [mode, setMode] = useState<'landing'|'signin'|'signup'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    Animated.timing(fadeAnim,{toValue:1,duration:600,useNativeDriver:true}).start();
  },[]);

  function handleSocialAuth(provider: string) {
    // Simulate social auth — in production connect to Firebase/Supabase
    const mockName = provider === 'Apple' ? 'Apple User' : 'Google User';
    const mockEmail = provider === 'Apple' ? 'user@icloud.com' : 'user@gmail.com';
    onAuth(mockName, mockEmail);
  }

  function handleEmailAuth() {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
    onAuth(name.trim() || email.split('@')[0], email.trim());
  }

  if (mode === 'landing') return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <StatusBar barStyle="light-content"/>
      <Animated.View style={{flex:1,opacity:fadeAnim,paddingHorizontal:32,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:80,marginBottom:16}}>🫀</Text>
        <Text style={{fontSize:40,fontWeight:'800',color:C.text,marginBottom:8}}>Pulse</Text>
        <Text style={{fontSize:17,color:C.sub,textAlign:'center',lineHeight:26,marginBottom:60}}>{"The ambient loneliness detector.\nBuilt to notice when you're drifting."}</Text>

        {/* Social Auth Buttons */}
        <TouchableOpacity onPress={()=>handleSocialAuth('Apple')} style={{width:'100%',backgroundColor:'#FFFFFF',borderRadius:14,paddingVertical:15,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:12}}>
          <Text style={{fontSize:20,marginRight:8,color:'#000',fontWeight:'500'}}></Text>
          <Text style={{fontSize:16,fontWeight:'600',color:'#000'}}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>handleSocialAuth('Google')} style={{width:'100%',backgroundColor:C.card,borderRadius:14,paddingVertical:15,flexDirection:'row',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.border,marginBottom:24}}>
          <View style={{width:22,height:22,borderRadius:2,marginRight:10,overflow:'hidden',flexDirection:'row',flexWrap:'wrap'}}>
            <View style={{width:11,height:11,backgroundColor:'#4285F4'}}/>
            <View style={{width:11,height:11,backgroundColor:'#EA4335'}}/>
            <View style={{width:11,height:11,backgroundColor:'#34A853'}}/>
            <View style={{width:11,height:11,backgroundColor:'#FBBC05'}}/>
          </View>
          <Text style={{fontSize:16,fontWeight:'600',color:C.text}}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{flexDirection:'row',alignItems:'center',width:'100%',marginBottom:24}}>
          <View style={{flex:1,height:1,backgroundColor:C.border}}/>
          <Text style={{color:C.dim,paddingHorizontal:12,fontSize:13}}>or</Text>
          <View style={{flex:1,height:1,backgroundColor:C.border}}/>
        </View>

        <TouchableOpacity onPress={()=>setMode('signup')} style={{width:'100%',backgroundColor:C.gold,borderRadius:14,paddingVertical:15,alignItems:'center',marginBottom:12}}>
          <Text style={{fontSize:16,fontWeight:'700',color:'#000'}}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setMode('signin')}>
          <Text style={{fontSize:15,color:C.sub}}>Already have an account? <Text style={{color:C.gold,fontWeight:'600'}}>Sign in</Text></Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={{textAlign:'center',color:C.dim,fontSize:11,paddingBottom:32,paddingHorizontal:32}}>By continuing you agree to our Terms of Service and Privacy Policy. All data is processed on-device. 🔒</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <TouchableOpacity onPress={()=>setMode('landing')} style={{padding:20,paddingBottom:0}}>
        <Text style={{color:C.gold,fontSize:16}}>← Back</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
        <ScrollView contentContainerStyle={{padding:32}}>
          <Text style={{fontSize:28,fontWeight:'700',color:C.text,marginBottom:8}}>{mode==='signup'?'Create Account':'Welcome back'}</Text>
          <Text style={{fontSize:15,color:C.sub,marginBottom:32}}>{mode==='signup'?'Start your connection journey':'Sign in to continue'}</Text>

          {mode==='signup'&&(
            <View style={{marginBottom:16}}>
              <Text style={{fontSize:13,color:C.sub,marginBottom:8,fontWeight:'600'}}>YOUR NAME</Text>
              <TextInput style={{backgroundColor:C.card,borderRadius:12,padding:16,fontSize:16,color:C.text,borderWidth:1,borderColor:C.border}} placeholder="First name" placeholderTextColor={C.dim} value={name} onChangeText={setName}/>
            </View>
          )}

          <View style={{marginBottom:16}}>
            <Text style={{fontSize:13,color:C.sub,marginBottom:8,fontWeight:'600'}}>EMAIL</Text>
            <TextInput style={{backgroundColor:C.card,borderRadius:12,padding:16,fontSize:16,color:C.text,borderWidth:1,borderColor:C.border}} placeholder="you@email.com" placeholderTextColor={C.dim} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          </View>

          <View style={{marginBottom:error?12:32}}>
            <Text style={{fontSize:13,color:C.sub,marginBottom:8,fontWeight:'600'}}>PASSWORD</Text>
            <TextInput style={{backgroundColor:C.card,borderRadius:12,padding:16,fontSize:16,color:C.text,borderWidth:1,borderColor:C.border}} placeholder="Min 6 characters" placeholderTextColor={C.dim} value={password} onChangeText={setPassword} secureTextEntry/>
          </View>

          {!!error&&<Text style={{color:C.red,fontSize:14,marginBottom:16}}>{error}</Text>}

          <TouchableOpacity onPress={handleEmailAuth} style={{backgroundColor:C.gold,borderRadius:14,paddingVertical:16,alignItems:'center',marginBottom:20}}>
            <Text style={{color:'#000',fontSize:16,fontWeight:'700'}}>{mode==='signup'?'Create Account':'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>setMode(mode==='signup'?'signin':'signup')} style={{alignItems:'center'}}>
            <Text style={{color:C.sub,fontSize:14}}>{mode==='signup'?'Already have an account? ':'No account? '}<Text style={{color:C.gold,fontWeight:'600'}}>{mode==='signup'?'Sign in':'Create one'}</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── PROFILE SCREEN ────────────────────────────────────────────────────────────
function ProfileScreen({ name, email, onLogout }: { name:string; email:string; onLogout:()=>void }) {
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const [notifications, setNotifications] = useState(true);
  const [passive, setPassive] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:120}}>
        <Text style={{fontSize:24,fontWeight:'700',color:C.text,marginBottom:24}}>Profile</Text>

        {/* Avatar */}
        <View style={{alignItems:'center',marginBottom:28}}>
          <View style={{width:80,height:80,borderRadius:40,backgroundColor:C.gold,alignItems:'center',justifyContent:'center',marginBottom:12}}>
            <Text style={{fontSize:30,fontWeight:'800',color:'#000'}}>{initials}</Text>
          </View>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text}}>{name}</Text>
          <Text style={{fontSize:14,color:C.sub,marginTop:4}}>{email}</Text>
        </View>

        {/* Stats */}
        <View style={{flexDirection:'row',gap:12,marginBottom:24}}>
          {[{label:'Days Active',value:'7'},{label:'Nudges Taken',value:'12'},{label:'Avg Score',value:'68%'}].map((s,i)=>(
            <View key={i} style={{flex:1,backgroundColor:C.card,borderRadius:14,padding:14,alignItems:'center',borderWidth:1,borderColor:C.border}}>
              <Text style={{fontSize:20,fontWeight:'800',color:C.gold}}>{s.value}</Text>
              <Text style={{fontSize:11,color:C.dim,marginTop:4,textAlign:'center'}}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={{fontSize:13,color:C.dim,fontWeight:'700',letterSpacing:1,marginBottom:12}}>SETTINGS</Text>

        <View style={{backgroundColor:C.card,borderRadius:16,borderWidth:1,borderColor:C.border,marginBottom:16}}>
          {[
            {label:'Push Notifications',sub:'Nudges and connection alerts',value:notifications,toggle:()=>setNotifications(v=>!v)},
            {label:'Passive Monitoring',sub:'Background signal processing',value:passive,toggle:()=>setPassive(v=>!v)},
          ].map((item,i)=>(
            <View key={i} style={{flexDirection:'row',alignItems:'center',padding:16,borderBottomWidth:i===0?1:0,borderColor:C.border}}>
              <View style={{flex:1}}>
                <Text style={{fontSize:15,color:C.text,fontWeight:'500'}}>{item.label}</Text>
                <Text style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sub}</Text>
              </View>
              <TouchableOpacity onPress={item.toggle} style={{width:50,height:28,borderRadius:14,backgroundColor:item.value?C.gold:C.border,justifyContent:'center',paddingHorizontal:3}}>
                <View style={{width:22,height:22,borderRadius:11,backgroundColor:'#fff',alignSelf:item.value?'flex-end':'flex-start'}}/>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={{backgroundColor:C.card,borderRadius:16,borderWidth:1,borderColor:C.border,marginBottom:24}}>
          {['Privacy Policy','Terms of Service','About Pulse'].map((item,i,arr)=>(
            <TouchableOpacity key={item} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:i<arr.length-1?1:0,borderColor:C.border}}>
              <Text style={{fontSize:15,color:C.text}}>{item}</Text>
              <Text style={{color:C.dim}}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        {!showLogoutConfirm ? (
          <TouchableOpacity onPress={()=>setShowLogoutConfirm(true)} style={{backgroundColor:C.card,borderRadius:14,paddingVertical:16,alignItems:'center',borderWidth:1,borderColor:C.red}}>
            <Text style={{color:C.red,fontSize:16,fontWeight:'600'}}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <View style={{backgroundColor:C.card,borderRadius:14,padding:20,borderWidth:1,borderColor:C.red}}>
            <Text style={{color:C.text,fontSize:16,fontWeight:'600',marginBottom:8,textAlign:'center'}}>Sign out of Pulse?</Text>
            <Text style={{color:C.sub,fontSize:14,textAlign:'center',marginBottom:20}}>Your data stays on your device.</Text>
            <View style={{flexDirection:'row',gap:12}}>
              <TouchableOpacity onPress={()=>setShowLogoutConfirm(false)} style={{flex:1,backgroundColor:C.border,borderRadius:10,paddingVertical:12,alignItems:'center'}}>
                <Text style={{color:C.text,fontWeight:'600'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onLogout} style={{flex:1,backgroundColor:C.red,borderRadius:10,paddingVertical:12,alignItems:'center'}}>
                <Text style={{color:'#fff',fontWeight:'700'}}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = [{name:'Home',emoji:'🏠'},{name:'Chat',emoji:'💬'},{name:'Nudges',emoji:'🔔'},{name:'Events',emoji:'🤝'},{name:'Me',emoji:'👤'}];

export default function App() {
  const [user, setUser] = useState<{name:string;email:string}|null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  // Show auth first
  if (!user) return <AuthScreen onAuth={(name,email)=>{ setUser({name,email}); }}/>;
  // Then onboarding
  if (!onboarded) return <OnboardingScreen onDone={()=>setOnboarded(true)}/>;

  return (
    <View style={{flex:1,backgroundColor:C.bg}}>
      {activeTab==='Home'    && <HomeScreen name={user.name} onTab={setActiveTab}/>}
      {activeTab==='Chat'    && <ChatScreen/>}
      {activeTab==='Nudges'  && <NudgesScreen/>}
      {activeTab==='Events'  && <EventsScreen/>}
      {activeTab==='Me'      && <ProfileScreen name={user.name} email={user.email} onLogout={()=>{ setUser(null); setOnboarded(false); setActiveTab('Home'); }}/>}
      <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:C.card,
        borderTopWidth:1,borderColor:C.border,flexDirection:'row',
        paddingBottom:Platform.OS==='ios'?28:8,paddingTop:10}}>
        {TABS.map(t=>(
          <TouchableOpacity key={t.name} onPress={()=>setActiveTab(t.name)} style={{flex:1,alignItems:'center'}}>
            <Text style={{fontSize:22}}>{t.emoji}</Text>
            <Text style={{fontSize:10,color:activeTab===t.name?C.gold:C.dim,marginTop:3,fontWeight:activeTab===t.name?'700':'400'}}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

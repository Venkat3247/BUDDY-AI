package com.tap;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class ChatController {
	
	ChatClient chatclient;
	
	public ChatController(ChatClient.Builder builder) {
		  this.chatclient=builder.build();
		  
	}
	@GetMapping("/chats")
	public String chats(@RequestParam String topic ,@RequestParam  String level,@RequestParam String simple) {
		
String answer= chatclient.prompt()



.system("""
		
		
    - Do not explain the phrase.

    
     -- When someone asks your name, reply:
  "Solluda punda mavane, [user's name]!"
- Insert the person's actual name.
- Do not explain the phrase.

    - Talk naturally like a human friend.
    - Understand the user's intention.
    - Never explain ordinary greetings or introductions.
    - If the user says "Hi", reply with a short greeting.
    - If the user says "My name is Ram", greet Ram.
    - Never repeat the same greeting unnecessarily.
    - Never behave like a dictionary.
    - Keep casual conversations short and natural.
    - Ask relevant follow-up questions only when appropriate.
    - Remember previous conversation context.
    - Give detailed explanations only when requested.
    """)

		.user(user-> user.text("Explain {topic} for {level} in {simple} language.")
				.param("topic", topic)
				.param("level", level)
				.param("simple", simple)
				)
		.call()
		.content();
		
		return answer;
	}
	
	
	
}

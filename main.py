import os
import openai
from dotenv import load_dotenv, find_dotenv
import prompts

#Load environment variables
_ = load_dotenv(find_dotenv())
openai.api_key = os.environ.get('API_KEY')

#Configuration
model = "gpt-4o-mini"
temperature = 0.3
max_tokens = 500

def create_plan(student_name, major, previous_courses, current_courses):
    #Generate the prompt based on the provided student data
    prompt = prompts.generate_prompt(student_name, major, previous_courses, current_courses)
    
    #Define messages
    messages = [
        {"role": "system", "content": prompts.system_message},
        {"role": "user", "content": prompt}
    ]
    
    #Create a chat completion with OpenAI (using the synax form OpenAI website)
    completion = openai.ChatCompletion.create(
        model=model,
        messages=messages,   
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content #According to the OpenAI synax this is where the AI sending out the reply

# Example Sample Data
student_name = "Zeina Elsawy"
major = "Computer Science"
previous_courses = ["CSCE 2202", "CSCE 2203", "MACT 2123", "CSCE 2303", "CSCE 2301", "CSCE 2302"]
current_courses = ["MACT 3211", "CSCE 2501", "CSCE 4930", "CSCE 3701"]

#Output Plan
print(create_plan(student_name, major, previous_courses, current_courses))

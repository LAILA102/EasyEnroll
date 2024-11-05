system_message = """
You are an academic advisor AI helping university students create a semester course registration plan. 
Consider each student's major, previously registered courses, and currently registered courses. 
Check the prerequisites and recommend a semester plan with the best sequence of courses to help them progress smoothly toward their degree requirements.
"""

def generate_prompt(student_name, major, previous_courses, current_courses):
    return f"""
    Generate a semester course plan for {student_name}, who is majoring in {major}. 
    The student has completed the following courses: {previous_courses}. They are currently registered in these courses: {current_courses}.
    Based on the prerequisite requirements, recommend the best courses for the next semester to ensure steady progress toward graduation. 
    Prioritize courses that are prerequisites for other major courses, and suggest electives if needed.
    """

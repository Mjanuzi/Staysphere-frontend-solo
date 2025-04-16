---
name: Custom issue template frontend
about: For frontend issues and this is for helping the thoughtprocess.
title: ''
labels: frontend
assignees: ''

---

1.     Clarity: Everyone understands the scope and expectations. 
2.     Reproducibility: Technical details reduce back-and-forth questions.
3.     Accountability: Assignees and checklists track progress.
4.     Consistency: Labels help filter/search issues later.

###  **Description**  
*What needs to be done? Why is this important?*  
- The login page’s form is not responsive on mobile devices.  
- This task ensures the form adapts to screen sizes below 768px.

---

###  **Acceptance Criteria**  
*What does "done" look like?*  
- [ ] Form fields stack vertically on mobile screens.  
- [ ] Button text remains readable on small screens.  
- [ ] Tested on Chrome, Safari, and Firefox.
- [ ] If it's no text make it readable by a screen reader.

---

###  **Technical Details**  
*Relevant code, dependencies, or design references*  
- **Component**: `src/pages/Login/LoginForm.jsx`  
- **Styling**:  TBD
- **Design Mock**: [Figma Link](https://figma.com/...)  

---

###  **Tasks**  
*Breakdown of steps (optional but helpful for complex issues)*  
- [ ] Add mobile media queries to `LoginForm.css`.  
- [ ] Test layout on Chrome DevTools device emulator.  

---

###  **Notes**  
- Coordinate with the backend on API endpoint changes.  
- Avoid hardcoding colors— Talk with the group and send screenshot in discord.

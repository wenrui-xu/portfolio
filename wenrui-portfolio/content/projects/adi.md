---
type: project
title: ADI
slug: adi
categories: [apps]
lifecycle: completed
featured: true
published: true
order: 1
year: '2025–2026'
role: Solo product design, Android development and user testing
projectType: Final-year project · Android app
status: Completed · defended October 2026
summary: An Android planning app with adapted task flows, visual routines and tutor support for autistic and ADHD users.
technologies: [Kotlin, Android, Jetpack Compose, Room, Vosk, Gemini, AI]
primaryTags: [Kotlin, Jetpack Compose, AI]
thumbnail: ''
previewVideo: ''
github: ''
process: [User needs and research, UX/UI in Figma, Kotlin and Compose development, Voice and API integration, User testing]
gallery: []
---
## Overview

ADI (Asistente Digital Inteligente) is my solo final-year Multimedia Engineering project: a native Android app designed to make planning and daily routines more accessible for autistic people, people with ADHD and their tutors. It brings together tasks and subtasks, recurring routines, pictogram-based sequences, and day, week and month calendar views. The tutor mode provides additional controls protected by a PIN.

The app also includes reminders, progress statistics, photo-based task verification, text and voice interaction, and configurable views to suit different levels of detail. I developed it across 2025 and 2026, completed it in 2026, and defended it at the Universitat de València in October 2026 with a grade of 9/10.

## My role

I designed and built ADI independently, from the user flows and Figma prototypes to the Android implementation and evaluation. Kotlin and Jetpack Compose power the UI; Room stores data locally. I integrated ARASAAC pictograms, Vosk and Android speech recognition for voice interaction, and the Gemini API to interpret natural-language requests for tasks and sequences. I also prepared and carried out user testing and analysed the feedback.

## Challenges

### Problem

One planning flow had to support different cognitive needs without forcing everyone through the same dense interface.

### Why

Tasks may need to be broken into smaller steps, presented with pictograms or managed with a tutor. Voice input and recurring routines introduce additional states and possible points of confusion.

### Solution

I built configurable task and calendar views, visual sequences, and a separate tutor mode. I tested task creation, spoken input, repeated subtasks, routine completion and navigation with users and used their observations to identify improvements.

### Result

Testing exposed specific usability issues around voice cues, duplicated subtasks, finishing routines and returning to previous screens. These findings guided changes and documented the remaining opportunities for improvement.

## Process

I started with user needs and interaction design, built the UI in Figma, implemented the app in Kotlin and Compose, and connected local storage, pictograms, speech and AI-assisted interpretation. Finally, I ran user sessions and reviewed the issues they uncovered.

## Testing results

The app was completed and defended with a grade of 9/10. User testing produced concrete feedback rather than a claimed percentage improvement. [Watch the ADI demo ↗](https://youtu.be/nAiH9rMR5EQ). The source is not publicly available; screenshots can be added after review.

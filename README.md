# CPGC Warrior Tee Time Signup System

![CPGC Warriors Logo](images/GolfWarrior2.png)

A web-based application for managing golf tee time signups for the CPGC Warriors group.

## Overview

This application provides a simple and effective way for CPGC Warrior golf group members to sign up for tee times on a weekly basis. It features a user-friendly interface for members and an admin panel for managing available slots and signups.

## Features

### For Members
- View available tee time slots for the current week
- Sign up for one or multiple tee times with just your name
- See who else has signed up for each time slot
- Remove yourself or others from tee times if plans change

### For Administrators
- Password-protected admin panel
- Set the current week for tee time signups
- Define available tee time slots
- Clear all signups when needed (e.g., to start a new week)

## Technical Details

- Built as a single-page application using HTML, CSS, and JavaScript
- Uses Firebase Firestore for real-time data storage
- Responsive design that works well on desktop and mobile devices
- No user accounts required - simple and straightforward interface

## How to Use

### As a Member
1. Enter your name in the input field
2. Select the tee time slot(s) you want to join
3. Click "Submit Signup" to register
4. View all current signups in the table below
5. If needed, use the "Remove" button to cancel a signup

### As an Administrator
1. Scroll to the bottom of the page and enter the admin password
2. Update the "Week of" field with the current week (e.g., "06/24/2025")
3. Enter each tee time slot on a new line in the "Slot Dates" field
   ```
   Monday 9:00am
   Tuesday 10:00am
   Wednesday 8:30am
   ```
4. Click "Apply Changes" to update the system
5. Use "Delete All Signups" when needed to clear all current registrations

## Deployment

This application is hosted online and accessible to all CPGC Warriors members. The data is synchronized in real-time, so all users see the most current signup information.

## Development

This project is maintained by the CPGC Warriors golf group. The codebase is structured as follows:

- `index.html` - Contains all HTML, CSS, and JavaScript for the application
- `images/` - Contains the CPGC Warriors logo and other images

## Contact

For questions or assistance with the tee time signup system, please contact the CPGC Warriors administrator.

---

Last Updated: June 17, 2025

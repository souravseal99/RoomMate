# Introduction

## Project Overview
**RoomMate** is a professional-grade, full-stack web application designed to streamline shared living management. By centralizing essential household tasks, it fosters transparency and reduces friction between roommates. The platform provides integrated tools for financial tracking, task accountability, and resource management.

## Problem Statement
Living in a shared environment often leads to several recurring challenges:
*   **Financial Ambiguity**: Manual tracking and splitting of expenses are error-prone and often lead to disputes.
*   **Task Neglect**: Without a centralized schedule, household chores are frequently forgotten or unfairly distributed.
*   **Inventory Depletion**: Essential shared resources often run out without notice, causing daily inconveniences.
*   **Lack of Insight**: Household members lack a clear, data-driven overview of their contributions and spending habits.

## Solution Explanation
RoomMate addresses these challenges by providing a digital "Single Source of Truth" for the household. By automating expense calculations, scheduling recurring chores, and monitoring inventory thresholds, the application ensures every member stays informed and accountable, promoting a harmonious living space.

## Key Features
*   **Expense Tracking & Splitting**: Automated calculation of individual shares for shared costs.
*   **Chore Management**: Assignment of tasks with customizable frequency, priority, and progress tracking.
*   **Inventory & Shopping Lists**: Real-time monitoring of shared supplies with automated shopping list generation.
*   **Household Statistics**: Visual dashboards for spending trends and chore completion rates.
*   **Secure Authentication**: Industry-standard JWT-based security with access and refresh token rotation.

## Target Users
*   **Students & Young Professionals** in shared apartments.
*   **Co-living Communities** focused on collaborative resource sharing.
*   **Families** seeking a simple tool for domestic task and grocery management.

## High-level System Idea
RoomMate utilizes a modern client-server architecture. The **React-based frontend (Vite + TypeScript)** ensures a highly responsive and type-safe user experience. The **Node.js/Express backend** serves as the business logic layer, communicating with a **PostgreSQL database** through the **Prisma ORM** for efficient and reliable data persistence.

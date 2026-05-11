---
name: Testing & Implementation Standards
description: Rule for tests
---

<!-- @format -->

🛠️ Testing & Implementation Standards

    Test Environment: Always use @nestjs/testing TestingModule for both Commands and Queries to ensure dependency injection remains consistent with the production environment.

    Entity Mocking: Never use load or create for mocks in tests; always use the createFake factory method on Entities to keep test data generation clean and isolated.

    Ensure comprehensive coverage of all possible edge cases.

    Standard Providers: Every test module must provide:

        BaseTokens.DBContext (using createMockDBContext)

        BaseTokens.EventDispatcher (using createMockEventDispatcher)

    File Structure: Spec files must reside in the same directory as the source file, following the naming convention: {filename}.spec.ts.

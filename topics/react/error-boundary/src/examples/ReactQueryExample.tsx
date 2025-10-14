/**
 * React Query v5와 Error Boundary 통합 예제
 */

import React from "react";
import {
  useQuery,
  useSuspenseQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AsyncBoundary, QueryBoundary } from "../components/AsyncBoundary";
import { SmartErrorFallback } from "../components/ErrorFallback";
import { useAsyncError } from "../hooks/useAsyncError";

// ============================================================================
// API 함수들
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const fetchUserById = async (id: number): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error(`User ${id} not found`);
  return response.json();
};

// ============================================================================
// v5 패턴 1: useSuspenseQuery + AsyncBoundary
// ============================================================================

function UserListWithSuspense() {
  // v5의 useSuspenseQuery는 자동으로 Suspense와 통합됨
  const { data } = useSuspenseQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <div className="space-y-2">
      {data.map((user) => (
        <div key={user.id} className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      ))}
    </div>
  );
}

export function SuspenseQueryExample() {
  return (
    <AsyncBoundary
      suspenseFallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="ml-3 text-gray-600">사용자 목록 로딩 중...</span>
        </div>
      }
      errorFallback={<SmartErrorFallback />}
    >
      <UserListWithSuspense />
    </AsyncBoundary>
  );
}

// ============================================================================
// v5 패턴 2: useQuery (기존 방식) + 수동 에러 처리
// ============================================================================

function UserListWithManualError() {
  const throwError = useAsyncError();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    // v5에서는 throwOnError 옵션 사용
    throwOnError: true, // 에러 발생 시 Error Boundary로 전파
  });

  // useQuery with throwOnError는 성공/로딩만 처리
  if (isLoading) {
    return <div className="p-4 text-gray-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-2">
      {data?.map((user) => (
        <div key={user.id} className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      ))}
    </div>
  );
}

export function ManualErrorQueryExample() {
  return (
    <QueryBoundary>
      <UserListWithManualError />
    </QueryBoundary>
  );
}

// ============================================================================
// v5 패턴 3: 중첩된 Query + 계층적 Error Boundary
// ============================================================================

function UserDetail({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUserById(userId),
  });

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-bold text-lg">{user.name}</h4>
      <p className="text-sm text-gray-700">{user.email}</p>
    </div>
  );
}

function UserList() {
  const { data: users } = useSuspenseQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            className="w-full p-3 text-left bg-white rounded-lg shadow hover:bg-gray-50"
          >
            {user.name}
          </button>
        ))}
      </div>

      {selectedUserId && (
        <AsyncBoundary
          suspenseFallback={<div className="p-4">사용자 정보 로딩 중...</div>}
          errorFallback={
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              사용자 정보를 불러올 수 없습니다.
            </div>
          }
        >
          <UserDetail userId={selectedUserId} />
        </AsyncBoundary>
      )}
    </div>
  );
}

export function NestedQueryExample() {
  return (
    <AsyncBoundary
      suspenseFallback={<div className="p-8">목록 로딩 중...</div>}
      errorFallback={<SmartErrorFallback />}
    >
      <UserList />
    </AsyncBoundary>
  );
}

// ============================================================================
// v5 패턴 4: Query 에러 리셋과 재시도
// ============================================================================

function UserListWithReset() {
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 3, // 3번까지 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return (
    <div className="space-y-2">
      {data.map((user) => (
        <div key={user.id} className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">{user.name}</h3>
        </div>
      ))}
    </div>
  );
}

export function QueryWithResetExample() {
  const queryClient = useQueryClient();

  return (
    <AsyncBoundary
      suspenseFallback={<div className="p-8">로딩 중...</div>}
      errorFallback={<SmartErrorFallback />}
      onReset={() => {
        // 에러 발생 시 리셋 버튼 클릭 → 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }}
    >
      <UserListWithReset />
    </AsyncBoundary>
  );
}

// ============================================================================
// 전체 앱 예제
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분 (v5에서 cacheTime → gcTime)
    },
  },
});

export function ReactQueryApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">
            패턴 1: useSuspenseQuery + AsyncBoundary
          </h2>
          <SuspenseQueryExample />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">
            패턴 2: useQuery + throwOnError
          </h2>
          <ManualErrorQueryExample />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">패턴 3: 중첩 Query</h2>
          <NestedQueryExample />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">패턴 4: 에러 리셋</h2>
          <QueryWithResetExample />
        </section>
      </div>
    </QueryClientProvider>
  );
}

// ============================================================================
// v4 → v5 마이그레이션 가이드
// ============================================================================

/**
 * React Query v4 → v5 주요 변경사항
 *
 * 1. Suspense 옵션 제거
 *    ❌ useQuery({ suspense: true })
 *    ✅ useSuspenseQuery({ ... })
 *
 * 2. cacheTime → gcTime 이름 변경
 *    ❌ cacheTime: 1000 * 60
 *    ✅ gcTime: 1000 * 60
 *
 * 3. Error Boundary 통합
 *    - useSuspenseQuery: 자동으로 에러를 throw
 *    - useQuery: throwOnError 옵션 사용
 *
 * 4. 패키지명 변경
 *    ❌ import { useQuery } from 'react-query'
 *    ✅ import { useQuery } from '@tanstack/react-query'
 */

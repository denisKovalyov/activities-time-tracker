export function Spinner({ duration = 0.8 }: { duration?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 24 30"
      width="100%"
      height="100%"
    >
      <rect
        x="0"
        y="10"
        width="4"
        height="10"
        fill="currentColor"
        opacity="0.2"
      >
        <animate
          attributeName="opacity"
          attributeType="XML"
          values="0.2; 1; .2"
          begin="0s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="height"
          attributeType="XML"
          values="10; 20; 10"
          begin="0s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          attributeType="XML"
          values="10; 5; 10"
          begin="0s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="8"
        y="10"
        width="4"
        height="10"
        fill="currentColor"
        opacity="0.2"
      >
        <animate
          attributeName="opacity"
          attributeType="XML"
          values="0.2; 1; .2"
          begin="0.15s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="height"
          attributeType="XML"
          values="10; 20; 10"
          begin="0.15s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          attributeType="XML"
          values="10; 5; 10"
          begin="0.15s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="16"
        y="10"
        width="4"
        height="10"
        fill="currentColor"
        opacity="0.2"
      >
        <animate
          attributeName="opacity"
          attributeType="XML"
          values="0.2; 1; .2"
          begin="0.3s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="height"
          attributeType="XML"
          values="10; 20; 10"
          begin="0.3s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          attributeType="XML"
          values="10; 5; 10"
          begin="0.3s"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}

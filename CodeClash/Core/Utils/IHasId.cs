namespace Core.Utils;

public interface IHasId<TKey> : IHasId
    where TKey : IEquatable<TKey>
{
    new TKey Id { get; set; }
}

public interface IHasId
{
    object Id { get; }
}